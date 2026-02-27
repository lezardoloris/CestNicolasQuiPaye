# Story 2.2: Denominator Data Pipeline & Cache (Python FastAPI)

Status: ready-for-dev

## Story

As a system operator,
I want the Cost to Nicolas engine to maintain a local cache of key demographic and fiscal denominators from official sources,
so that calculations are fast, independent of external APIs, and always available.

## Acceptance Criteria (BDD)

**Given** the Python FastAPI microservice is initialized,
**When** the service starts,
**Then** a `denominators` table is created (if not exists) in the PostgreSQL database with columns: `id` (serial PK), `key` (varchar 100, unique, not null), `value` (decimal 20,4, not null), `source_name` (varchar 255, not null), `source_url` (text, not null), `last_updated` (timestamp, not null), `update_frequency` (varchar 50, default 'quarterly'), `created_at` (timestamp),
**And** the table is seeded with the following initial denominator rows:
  - `france_population`: value from latest INSEE estimate, source_url pointing to `insee.fr`
  - `income_tax_payers`: value from latest DGFIP/INSEE data, source_url pointing to official publication
  - `france_households`: value from latest INSEE data, source_url pointing to `insee.fr`
  - `daily_median_net_income`: calculated as (annual median net income / 365), source_url pointing to `insee.fr`
  - `school_lunch_cost`: published average cost per school lunch, source_url pointing to official source
  - `hospital_bed_day_cost`: published average cost per hospital bed-day, source_url pointing to official source.

**Given** the FastAPI service exposes a `GET /api/denominators` endpoint,
**When** a client requests the endpoint,
**Then** the response is a JSON array of all denominator objects with fields: `key`, `value`, `source_name`, `source_url`, `last_updated`,
**And** the response is served from the local database cache, not from external APIs (NFR16).

**Given** a configurable cron schedule (default: quarterly, configurable via `DENOMINATOR_UPDATE_CRON` environment variable),
**When** the scheduled job runs,
**Then** the service fetches the latest values from the official source URLs,
**And** updates the `denominators` table with new values and `last_updated` timestamps,
**And** logs a summary of which denominators were updated and their old vs. new values,
**And** if any external fetch fails, the existing cached value is retained and an error is logged (NFR16).

**Given** an administrator calls `POST /api/denominators/refresh` with a valid admin API key,
**When** the request is processed,
**Then** a manual refresh of all denominators is triggered immediately,
**And** the response confirms which denominators were updated.

## Tasks / Subtasks

### Task 1: Python Project Scaffolding (AC1)
- [ ] Create the `cost-engine/` directory at the project root with the following structure:
  ```
  cost-engine/
  ├── pyproject.toml
  ├── requirements.txt
  ├── Dockerfile
  ├── .env.example
  ├── alembic.ini
  ├── alembic/
  │   ├── env.py
  │   └── versions/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── config.py
  │   ├── database.py
  │   ├── routers/
  │   │   ├── __init__.py
  │   │   ├── denominators.py
  │   │   ├── calculations.py
  │   │   └── health.py
  │   ├── services/
  │   │   ├── __init__.py
  │   │   ├── denominator_service.py
  │   │   ├── data_fetcher.py
  │   │   └── cost_calculator.py
  │   ├── models/
  │   │   ├── __init__.py
  │   │   └── denominators.py
  │   └── data/
  │       └── seed_denominators.json
  └── tests/
      ├── __init__.py
      ├── conftest.py
      ├── test_denominators.py
      ├── test_data_fetcher.py
      └── test_cost_calculator.py
  ```

- [ ] Create `cost-engine/requirements.txt` with pinned versions:
  ```
  fastapi==0.133.1
  uvicorn[standard]==0.34.0
  pydantic==2.11.1
  pydantic-settings==2.8.1
  sqlalchemy==2.0.40
  alembic==1.15.1
  psycopg2-binary==2.9.10
  asyncpg==0.31.0
  httpx==0.28.1
  apscheduler==3.11.0
  structlog==25.1.0
  python-dotenv==1.1.0
  ```

- [ ] Create `cost-engine/requirements-dev.txt`:
  ```
  pytest==8.4.0
  pytest-asyncio==0.25.3
  pytest-cov==6.1.1
  httpx==0.28.1
  ```

- [ ] Create `cost-engine/pyproject.toml`:
  ```toml
  [build-system]
  requires = ["setuptools>=75.0", "wheel"]
  build-backend = "setuptools.backends._legacy:_Backend"

  [project]
  name = "liberal-cost-engine"
  version = "1.0.0"
  description = "Cost to Nicolas calculation engine for LIBERAL"
  requires-python = ">=3.14"

  [project.optional-dependencies]
  test = ["pytest>=8.4", "pytest-asyncio>=0.25", "pytest-cov>=6.1", "httpx>=0.28"]

  [tool.pytest.ini_options]
  asyncio_mode = "auto"
  testpaths = ["tests"]
  ```

### Task 2: Dockerfile (AC1)
- [ ] Create `cost-engine/Dockerfile`:
  ```dockerfile
  FROM python:3.14.3-slim

  WORKDIR /app

  # Install system dependencies for psycopg2
  RUN apt-get update && apt-get install -y --no-install-recommends \
      libpq-dev gcc \
      && rm -rf /var/lib/apt/lists/*

  # Install Python dependencies
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt

  # Copy application code
  COPY . .

  # Expose port
  EXPOSE 8000

  # Health check
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
      CMD python -c "import httpx; httpx.get('http://localhost:8000/health')"

  # Run with uvicorn
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

### Task 3: FastAPI Application Setup (AC1, AC2)
- [ ] Create `cost-engine/app/config.py` using Pydantic Settings:
  ```python
  from pydantic_settings import BaseSettings

  class Settings(BaseSettings):
      database_url: str = "postgresql+asyncpg://user:password@localhost:5432/liberal"
      internal_api_key: str = "change-me-in-production"
      admin_api_key: str = "admin-change-me-in-production"
      denominator_update_cron: str = "0 0 1 */3 *"  # quarterly: 1st of Jan/Apr/Jul/Oct
      log_level: str = "INFO"

      model_config = {"env_prefix": "", "env_file": ".env"}

  _settings = None

  def get_settings() -> Settings:
      global _settings
      if _settings is None:
          _settings = Settings()
      return _settings
  ```

- [ ] Create `cost-engine/app/database.py` for async SQLAlchemy engine and session:
  ```python
  from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
  from app.config import get_settings

  engine = create_async_engine(get_settings().database_url, echo=False)
  async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

  async def get_db() -> AsyncSession:
      async with async_session() as session:
          yield session
  ```

- [ ] Create `cost-engine/app/main.py` with FastAPI app initialization:
  ```python
  from contextlib import asynccontextmanager
  from fastapi import FastAPI, Depends, Header, HTTPException
  from app.config import Settings, get_settings
  from app.routers import denominators, calculations, health
  from app.services.denominator_service import DenominatorService
  from app.database import engine
  from app.models.denominators import Base
  import structlog

  logger = structlog.get_logger()

  @asynccontextmanager
  async def lifespan(app: FastAPI):
      # Startup: create tables and seed data
      async with engine.begin() as conn:
          await conn.run_sync(Base.metadata.create_all)
      service = DenominatorService()
      await service.seed_if_empty()
      # Start scheduler for periodic updates
      service.start_scheduler()
      logger.info("Cost engine started", version="1.0.0")
      yield
      # Shutdown
      service.stop_scheduler()
      await engine.dispose()

  app = FastAPI(
      title="LIBERAL Cost Engine",
      description="Cost to Nicolas calculation service",
      version="1.0.0",
      lifespan=lifespan,
  )

  # Internal API key verification
  async def verify_internal_key(
      x_internal_key: str = Header(...),
      settings: Settings = Depends(get_settings),
  ):
      if x_internal_key != settings.internal_api_key:
          raise HTTPException(status_code=403, detail="Invalid internal key")

  # Admin API key verification
  async def verify_admin_key(
      x_admin_key: str = Header(...),
      settings: Settings = Depends(get_settings),
  ):
      if x_admin_key != settings.admin_api_key:
          raise HTTPException(status_code=403, detail="Invalid admin key")

  app.include_router(health.router)
  app.include_router(denominators.router)
  app.include_router(
      calculations.router,
      dependencies=[Depends(verify_internal_key)],
  )
  ```

### Task 4: Denominators Database Model (AC1)
- [ ] Create `cost-engine/app/models/denominators.py` with SQLAlchemy model:
  ```python
  from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, func
  from sqlalchemy.orm import DeclarativeBase

  class Base(DeclarativeBase):
      pass

  class Denominator(Base):
      __tablename__ = "denominators"

      id = Column(Integer, primary_key=True, autoincrement=True)
      key = Column(String(100), unique=True, nullable=False, index=True)
      value = Column(Numeric(20, 4), nullable=False)
      source_name = Column(String(255), nullable=False)
      source_url = Column(Text, nullable=False)
      last_updated = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
      update_frequency = Column(String(50), nullable=False, default="quarterly")
      created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
  ```

### Task 5: Seed Data (AC1)
- [ ] Create `cost-engine/app/data/seed_denominators.json`:
  ```json
  [
    {
      "key": "france_population",
      "value": 68373433,
      "source_name": "INSEE - Population totale au 1er janvier 2025",
      "source_url": "https://www.insee.fr/fr/statistiques/5894851",
      "update_frequency": "quarterly"
    },
    {
      "key": "income_tax_payers",
      "value": 18600000,
      "source_name": "DGFIP - Foyers fiscaux imposables a l'impot sur le revenu 2024",
      "source_url": "https://www.impots.gouv.fr/www2/fichiers/statistiques/base_statistiques.htm",
      "update_frequency": "yearly"
    },
    {
      "key": "france_households",
      "value": 30400000,
      "source_name": "INSEE - Nombre de menages en France 2024",
      "source_url": "https://www.insee.fr/fr/statistiques/2381486",
      "update_frequency": "yearly"
    },
    {
      "key": "daily_median_net_income",
      "value": 62.4658,
      "source_name": "INSEE - Revenu salarial median net annuel 2023 (22 800 EUR / 365)",
      "source_url": "https://www.insee.fr/fr/statistiques/6436313",
      "update_frequency": "yearly"
    },
    {
      "key": "school_lunch_cost",
      "value": 3.50,
      "source_name": "Cout moyen d'un repas de cantine scolaire en France 2024",
      "source_url": "https://www.education.gouv.fr/la-restauration-scolaire-12340",
      "update_frequency": "yearly"
    },
    {
      "key": "hospital_bed_day_cost",
      "value": 1400.00,
      "source_name": "Cout moyen d'une journee d'hospitalisation en France 2024",
      "source_url": "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/panoramas-de-la-drees",
      "update_frequency": "yearly"
    }
  ]
  ```

### Task 6: Denominator Service (AC1, AC3, AC4)
- [ ] Create `cost-engine/app/services/denominator_service.py`:
  - `seed_if_empty()`: Check if `denominators` table is empty, if so insert all seed data from JSON
  - `get_all()`: Return all denominators from database (AC2)
  - `refresh_all()`: Iterate through all denominators, attempt to fetch updated values from their `source_url`, update `value` and `last_updated` if successful, log old vs new values (AC3, AC4)
  - `start_scheduler()`: Initialize APScheduler with cron trigger from `DENOMINATOR_UPDATE_CRON` env var (AC3)
  - `stop_scheduler()`: Gracefully shutdown scheduler
  - On fetch failure: retain existing cached value, log error with structlog (AC3, NFR16)

### Task 7: Data Fetcher Service (AC3)
- [ ] Create `cost-engine/app/services/data_fetcher.py`:
  - `fetch_insee_population()`: Fetch from INSEE API, parse population count
  - `fetch_dgfip_taxpayers()`: Fetch from DGFIP source, parse taxpayer count
  - `fetch_insee_households()`: Fetch from INSEE API, parse household count
  - `fetch_insee_median_income()`: Fetch from INSEE API, calculate daily median net income
  - `fetch_school_lunch_cost()`: Fetch from education.gouv.fr, parse average cost
  - `fetch_hospital_bed_cost()`: Fetch from DREES, parse average cost
  - Each fetcher uses `httpx.AsyncClient` with 30-second timeout
  - Each fetcher returns `Optional[Decimal]` -- `None` on failure
  - All external HTTP calls wrapped in try/except with structured logging

### Task 8: Denominators API Router (AC2, AC4)
- [ ] Create `cost-engine/app/routers/denominators.py`:
  ```python
  from fastapi import APIRouter, Depends, Header, HTTPException
  from app.services.denominator_service import DenominatorService
  from app.config import get_settings, Settings
  from pydantic import BaseModel
  from datetime import datetime
  from decimal import Decimal
  from typing import List

  router = APIRouter(prefix="/api", tags=["denominators"])

  class DenominatorResponse(BaseModel):
      key: str
      value: Decimal
      source_name: str
      source_url: str
      last_updated: datetime

      model_config = {"from_attributes": True}

  class RefreshResult(BaseModel):
      updated: List[str]
      failed: List[str]
      message: str

  @router.get("/denominators", response_model=List[DenominatorResponse])
  async def list_denominators():
      """Return all cached denominators (AC2)."""
      service = DenominatorService()
      return await service.get_all()

  @router.post("/denominators/refresh", response_model=RefreshResult)
  async def refresh_denominators(
      x_admin_key: str = Header(...),
      settings: Settings = Depends(get_settings),
  ):
      """Manually trigger denominator refresh (AC4)."""
      if x_admin_key != settings.admin_api_key:
          raise HTTPException(status_code=403, detail="Invalid admin key")
      service = DenominatorService()
      result = await service.refresh_all()
      return result
  ```

### Task 9: Health Check Router
- [ ] Create `cost-engine/app/routers/health.py`:
  ```python
  from fastapi import APIRouter
  from app.database import engine

  router = APIRouter(tags=["health"])

  @router.get("/health")
  async def health_check():
      try:
          async with engine.connect() as conn:
              await conn.execute(text("SELECT 1"))
          return {"status": "healthy", "database": "connected"}
      except Exception as e:
          return {"status": "unhealthy", "database": str(e)}
  ```

### Task 10: Docker Compose Integration
- [ ] Update `docker-compose.yml` at project root to include the cost-engine service:
  ```yaml
  cost-engine:
    build:
      context: ./cost-engine
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://liberal:liberal@postgres:5432/liberal
      INTERNAL_API_KEY: dev-internal-key
      ADMIN_API_KEY: dev-admin-key
      DENOMINATOR_UPDATE_CRON: "0 0 1 */3 *"
    depends_on:
      postgres:
        condition: service_healthy
  ```

### Task 11: Environment Configuration
- [ ] Create `cost-engine/.env.example`:
  ```bash
  DATABASE_URL=postgresql+asyncpg://liberal:liberal@localhost:5432/liberal
  INTERNAL_API_KEY=change-me-in-production
  ADMIN_API_KEY=admin-change-me-in-production
  DENOMINATOR_UPDATE_CRON=0 0 1 */3 *
  LOG_LEVEL=INFO
  ```

### Task 12: Tests (All ACs)
- [ ] Create `cost-engine/tests/conftest.py` with pytest fixtures:
  - Async test database setup with SQLite or test PostgreSQL
  - FastAPI TestClient fixture
  - Sample denominator data fixture
- [ ] Write `cost-engine/tests/test_denominators.py`:
  - `test_list_denominators_returns_all`: GET `/api/denominators` returns 6 items
  - `test_denominator_response_schema`: Response fields match `DenominatorResponse` model
  - `test_denominators_served_from_cache`: Response does not trigger external API calls
  - `test_refresh_requires_admin_key`: POST `/api/denominators/refresh` without key returns 403
  - `test_refresh_with_valid_key_succeeds`: POST with valid key returns refresh results
  - `test_seed_data_inserted_on_startup`: After startup, all 6 denominators exist
- [ ] Write `cost-engine/tests/test_data_fetcher.py`:
  - `test_fetch_failure_returns_none`: Mock HTTP failure returns None
  - `test_fetch_timeout_returns_none`: Mock timeout returns None
  - `test_existing_value_retained_on_failure`: After failed refresh, original value unchanged

## Dev Notes

### Architecture & Patterns
- The Python FastAPI service is a **standalone microservice** deployed as a container on Scaleway Serverless Containers. It is **not exposed to the public internet** -- all access is via internal API key from the Next.js backend.
- The `GET /api/denominators` endpoint IS publicly accessible (no auth required) because the data is public and serves the Data Status Page (Story 2.4) and Methodology Page (Story 2.5). The Next.js frontend will proxy requests to this endpoint.
- The `POST /api/denominators/refresh` endpoint requires the `X-Admin-Key` header for security.
- The `POST /api/cost-to-nicolas` endpoint (Story 2.3) requires the `X-Internal-Key` header and is called only by the Next.js backend.
- Database tables are managed by SQLAlchemy + Alembic within the Python service, separate from the Next.js Drizzle migrations. The `denominators` table lives in the same PostgreSQL database but is owned by the Python service.
- The scheduler uses **APScheduler** with a configurable cron expression via `DENOMINATOR_UPDATE_CRON` env var. Default is quarterly (1st of January, April, July, October at midnight).

### Technical Requirements
- **Python 3.14.3**: Runtime
- **FastAPI 0.133.1**: Web framework with async support
- **SQLAlchemy 2.0.40**: Async ORM for database access
- **Alembic 1.15.1**: Database migration management
- **asyncpg 0.31.0**: Async PostgreSQL driver
- **httpx 0.28.1**: Async HTTP client for fetching external data
- **APScheduler 3.11.0**: Scheduled cron jobs for denominator updates
- **structlog 25.1.0**: Structured JSON logging
- **Pydantic 2.11.1**: Data validation and settings management
- **uvicorn 0.34.0**: ASGI server
- **pytest 8.4.0**: Test framework
- **pytest-asyncio 0.25.3**: Async test support

### File Structure
```
cost-engine/
├── pyproject.toml                          # NEW - Python project config
├── requirements.txt                        # NEW - Pinned dependencies
├── requirements-dev.txt                    # NEW - Dev/test dependencies
├── Dockerfile                              # NEW - Container image
├── .env.example                            # NEW - Environment template
├── alembic.ini                             # NEW - Alembic config
├── alembic/
│   ├── env.py                              # NEW - Alembic environment
│   └── versions/                           # NEW - Migration versions
├── app/
│   ├── __init__.py                         # NEW
│   ├── main.py                             # NEW - FastAPI app entry point
│   ├── config.py                           # NEW - Pydantic Settings
│   ├── database.py                         # NEW - SQLAlchemy async engine
│   ├── routers/
│   │   ├── __init__.py                     # NEW
│   │   ├── denominators.py                 # NEW - GET/POST denominators endpoints
│   │   ├── calculations.py                 # NEW (stub, completed in Story 2.3)
│   │   └── health.py                       # NEW - Health check endpoint
│   ├── services/
│   │   ├── __init__.py                     # NEW
│   │   ├── denominator_service.py          # NEW - Denominator CRUD + scheduling
│   │   ├── data_fetcher.py                 # NEW - External API fetchers
│   │   └── cost_calculator.py              # NEW (stub, completed in Story 2.3)
│   ├── models/
│   │   ├── __init__.py                     # NEW
│   │   └── denominators.py                 # NEW - SQLAlchemy Denominator model
│   └── data/
│       └── seed_denominators.json          # NEW - Initial seed data
└── tests/
    ├── __init__.py                         # NEW
    ├── conftest.py                         # NEW - Pytest fixtures
    ├── test_denominators.py                # NEW - Denominator endpoint tests
    └── test_data_fetcher.py                # NEW - Data fetcher tests
```

### Testing Requirements
- **pytest**: All Python tests run with `cd cost-engine && pytest`
- **pytest-asyncio**: For testing async endpoints and services
- **pytest-cov**: Coverage target >90% for denominator service, >85% for routers
- **httpx mock**: Use `httpx.MockTransport` or `respx` for mocking external API calls
- Test that seed data is correctly inserted on first startup
- Test that refresh operation logs old vs. new values
- Test that failed external fetches retain cached values
- Test that the scheduler initializes with correct cron expression

### UX/Design Notes
- This story has no direct frontend UX. It provides the data backend for Stories 2.3, 2.4, and 2.5.
- The denominator values will be displayed on the Data Status Page (Story 2.4) with French number formatting.

### Dependencies
- **PostgreSQL 17.9**: Database must be running and accessible
- No dependency on Next.js frontend stories
- No dependency on Epic 1 stories (authentication not required for denominator management)

### Seed Data Reference Values
| Key | Value | Source | Notes |
|-----|-------|--------|-------|
| `france_population` | ~68,373,433 | INSEE 2025 estimate | Updated quarterly |
| `income_tax_payers` | ~18,600,000 | DGFIP 2024 data | Updated yearly with tax season |
| `france_households` | ~30,400,000 | INSEE 2024 estimate | Updated yearly |
| `daily_median_net_income` | ~62.47 EUR | INSEE (22,800 EUR annual / 365) | Updated yearly |
| `school_lunch_cost` | ~3.50 EUR | Education.gouv.fr 2024 | Updated yearly |
| `hospital_bed_day_cost` | ~1,400 EUR | DREES 2024 | Updated yearly |

### References
- [Source: epics.md#Epic 2, Story 2.2]
- [Source: architecture.md#Section 5.3 - Cost Engine Structure]
- [Source: architecture.md#Section 3.3 - Python FastAPI Communication]
- [Source: prd.md#FR32, FR33, FR34, FR35, NFR16]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
