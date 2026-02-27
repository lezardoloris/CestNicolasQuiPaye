# Story 2.3: Cost to Nicolas Calculation Engine

Status: ready-for-dev

## Story

As a visitor or registered user (Nicolas),
I want the system to automatically calculate the personal financial impact of a government waste item,
so that I can understand what this waste means to me in relatable terms.

## Acceptance Criteria (BDD)

**Given** the FastAPI service exposes a `POST /api/cost-to-nicolas` endpoint,
**When** a request is sent with body `{ "amount_eur": <number> }`,
**Then** the response is a JSON object with the following calculated fields:
  - `cost_per_citizen`: `amount_eur / france_population`, formatted to 4 decimal places (FR11)
  - `cost_per_taxpayer`: `amount_eur / income_tax_payers`, formatted to 4 decimal places (FR12)
  - `cost_per_household`: `amount_eur / france_households`, formatted to 4 decimal places (FR13)
  - `days_of_work_equivalent`: `cost_per_taxpayer / daily_median_net_income`, formatted to 2 decimal places (FR14)
  - `equivalences`: an array containing at least one object like `{ "label": "repas de cantine scolaire", "count": <number>, "unit_cost": <number>, "source_url": "<url>" }` computed as `cost_per_citizen / school_lunch_cost` (FR15)
  - `denominators_used`: an array of objects `{ "key": "<key>", "value": <number>, "source_url": "<url>", "last_updated": "<ISO date>" }` for every denominator used in the calculation (FR16)
**And** the total response time is under 5 seconds (NFR3).

**Given** the `amount_eur` is zero or negative,
**When** the request is processed,
**Then** a `400 Bad Request` response is returned with body `{ "error": "amount_eur must be a positive number" }`.

**Given** a denominator value in the cache is null or zero,
**When** the calculation is attempted,
**Then** the affected metric is omitted from the response with a `"unavailable": true` flag,
**And** the remaining metrics are still calculated and returned.

**Given** the Next.js frontend calls the Cost to Nicolas API for a submission,
**When** the results are returned,
**Then** the frontend stores the results in the `cost_to_nicolas_results` JSONB column on the `submissions` table (added via migration in this story) so subsequent views do not re-calculate,
**And** the cached result includes a `calculated_at` timestamp.

## Tasks / Subtasks

### Task 1: Cost Calculator Service Implementation (AC1)
- [ ] Implement `cost-engine/app/services/cost_calculator.py` with the core calculation logic:
  ```python
  from decimal import Decimal, ROUND_HALF_UP
  from typing import Optional, List
  from pydantic import BaseModel
  from datetime import datetime

  class Equivalence(BaseModel):
      label: str
      count: float
      unit_cost: float
      source_url: str

  class DenominatorUsed(BaseModel):
      key: str
      value: float
      source_url: str
      last_updated: str  # ISO date string

  class CostToNicolasResult(BaseModel):
      amount_eur: float
      cost_per_citizen: Optional[float] = None
      cost_per_taxpayer: Optional[float] = None
      cost_per_household: Optional[float] = None
      days_of_work_equivalent: Optional[float] = None
      equivalences: List[Equivalence] = []
      denominators_used: List[DenominatorUsed] = []
      calculated_at: str  # ISO datetime string
      cost_per_citizen_unavailable: Optional[bool] = None
      cost_per_taxpayer_unavailable: Optional[bool] = None
      cost_per_household_unavailable: Optional[bool] = None
      days_of_work_unavailable: Optional[bool] = None

  class CostCalculator:
      """
      Core Cost to Nicolas calculation engine.

      Formulas:
      - cost_per_citizen     = amount_eur / france_population        (~68M)
      - cost_per_taxpayer    = amount_eur / income_tax_payers        (~18M)
      - cost_per_household   = amount_eur / france_households        (~30M)
      - days_of_work_equiv   = cost_per_taxpayer / daily_median_net_income
      - school_lunch_equiv   = cost_per_citizen / school_lunch_cost
      - hospital_bed_equiv   = cost_per_citizen / hospital_bed_day_cost
      """

      def __init__(self, denominators: dict):
          """
          Args:
              denominators: dict mapping key -> {value, source_url, last_updated}
          """
          self.denominators = denominators

      def _get_denom(self, key: str) -> Optional[Decimal]:
          """Get a denominator value, returning None if missing or zero."""
          entry = self.denominators.get(key)
          if entry is None:
              return None
          val = Decimal(str(entry["value"]))
          if val == 0:
              return None
          return val

      def _track_denom(self, key: str, used: list):
          """Add a denominator to the used list for transparency."""
          entry = self.denominators.get(key)
          if entry:
              used.append(DenominatorUsed(
                  key=key,
                  value=float(entry["value"]),
                  source_url=entry["source_url"],
                  last_updated=entry["last_updated"],
              ))

      def calculate(self, amount_eur: float) -> CostToNicolasResult:
          amount = Decimal(str(amount_eur))
          denominators_used = []
          result = CostToNicolasResult(
              amount_eur=amount_eur,
              calculated_at=datetime.utcnow().isoformat() + "Z",
          )

          # Cost per citizen: amount / france_population (~68M)
          pop = self._get_denom("france_population")
          if pop:
              result.cost_per_citizen = float(
                  (amount / pop).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
              )
              self._track_denom("france_population", denominators_used)
          else:
              result.cost_per_citizen_unavailable = True

          # Cost per taxpayer: amount / income_tax_payers (~18M)
          taxpayers = self._get_denom("income_tax_payers")
          if taxpayers:
              cost_per_taxpayer = amount / taxpayers
              result.cost_per_taxpayer = float(
                  cost_per_taxpayer.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
              )
              self._track_denom("income_tax_payers", denominators_used)

              # Days of work: cost_per_taxpayer / daily_median_net_income
              daily_income = self._get_denom("daily_median_net_income")
              if daily_income:
                  result.days_of_work_equivalent = float(
                      (cost_per_taxpayer / daily_income).quantize(
                          Decimal("0.01"), rounding=ROUND_HALF_UP
                      )
                  )
                  self._track_denom("daily_median_net_income", denominators_used)
              else:
                  result.days_of_work_unavailable = True
          else:
              result.cost_per_taxpayer_unavailable = True
              result.days_of_work_unavailable = True

          # Cost per household: amount / france_households (~30M)
          households = self._get_denom("france_households")
          if households:
              result.cost_per_household = float(
                  (amount / households).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
              )
              self._track_denom("france_households", denominators_used)
          else:
              result.cost_per_household_unavailable = True

          # Equivalences
          equivalences = []

          # School lunch equivalence: cost_per_citizen / school_lunch_cost
          if result.cost_per_citizen is not None:
              lunch_cost = self._get_denom("school_lunch_cost")
              if lunch_cost:
                  citizen_amount = Decimal(str(result.cost_per_citizen))
                  lunch_count = float(
                      (citizen_amount / lunch_cost).quantize(
                          Decimal("0.01"), rounding=ROUND_HALF_UP
                      )
                  )
                  lunch_entry = self.denominators.get("school_lunch_cost", {})
                  equivalences.append(Equivalence(
                      label="repas de cantine scolaire",
                      count=lunch_count,
                      unit_cost=float(lunch_cost),
                      source_url=lunch_entry.get("source_url", ""),
                  ))
                  self._track_denom("school_lunch_cost", denominators_used)

              # Hospital bed equivalence: cost_per_citizen / hospital_bed_day_cost
              hospital_cost = self._get_denom("hospital_bed_day_cost")
              if hospital_cost:
                  citizen_amount = Decimal(str(result.cost_per_citizen))
                  bed_count = float(
                      (citizen_amount / hospital_cost).quantize(
                          Decimal("0.0001"), rounding=ROUND_HALF_UP
                      )
                  )
                  hospital_entry = self.denominators.get("hospital_bed_day_cost", {})
                  equivalences.append(Equivalence(
                      label="journee d'hospitalisation",
                      count=bed_count,
                      unit_cost=float(hospital_cost),
                      source_url=hospital_entry.get("source_url", ""),
                  ))
                  self._track_denom("hospital_bed_day_cost", denominators_used)

          result.equivalences = equivalences
          result.denominators_used = denominators_used

          return result
  ```

### Task 2: Calculations API Router (AC1, AC2)
- [ ] Create `cost-engine/app/routers/calculations.py`:
  ```python
  from fastapi import APIRouter, HTTPException
  from pydantic import BaseModel, Field
  from app.services.cost_calculator import CostCalculator, CostToNicolasResult
  from app.services.denominator_service import DenominatorService
  import structlog

  logger = structlog.get_logger()

  router = APIRouter(prefix="/api", tags=["calculations"])

  class CalculationRequest(BaseModel):
      amount_eur: float = Field(..., gt=0, description="Amount in EUR (must be positive)")

  @router.post("/cost-to-nicolas", response_model=CostToNicolasResult)
  async def calculate_cost_to_nicolas(request: CalculationRequest):
      """
      Calculate the personal financial impact of a government expense.

      Formulas:
      - cost_per_citizen = amount_eur / 68M (france_population)
      - cost_per_taxpayer = amount_eur / 18M (income_tax_payers)
      - cost_per_household = amount_eur / 30M (france_households)
      - days_of_work = cost_per_taxpayer / daily_median_net_income
      - equivalences: school lunches, hospital bed-days
      """
      service = DenominatorService()
      denominators = await service.get_all_as_dict()

      calculator = CostCalculator(denominators)
      result = calculator.calculate(request.amount_eur)

      logger.info(
          "cost_calculated",
          amount_eur=request.amount_eur,
          cost_per_citizen=result.cost_per_citizen,
          cost_per_taxpayer=result.cost_per_taxpayer,
      )

      return result
  ```

- [ ] Add Pydantic validation so that `amount_eur <= 0` returns 400 with `{ "error": "amount_eur must be a positive number" }` (AC2):
  ```python
  from fastapi.exceptions import RequestValidationError
  from fastapi.responses import JSONResponse

  @app.exception_handler(RequestValidationError)
  async def validation_exception_handler(request, exc):
      for error in exc.errors():
          if "amount_eur" in str(error.get("loc", [])):
              return JSONResponse(
                  status_code=400,
                  content={"error": "amount_eur must be a positive number"},
              )
      return JSONResponse(status_code=400, content={"error": str(exc)})
  ```

### Task 3: Denominator Service Extension (AC3)
- [ ] Add `get_all_as_dict()` method to `cost-engine/app/services/denominator_service.py`:
  ```python
  async def get_all_as_dict(self) -> dict:
      """Return denominators as dict for calculator consumption."""
      all_denoms = await self.get_all()
      return {
          d.key: {
              "value": d.value,
              "source_url": d.source_url,
              "last_updated": d.last_updated.isoformat() if d.last_updated else None,
          }
          for d in all_denoms
      }
  ```

### Task 4: Next.js Cost Engine Client (AC4)
- [ ] Create `src/lib/cost-engine/client.ts` for Next.js to call the Python service:
  ```typescript
  const COST_ENGINE_URL = process.env.COST_ENGINE_URL!;
  const COST_ENGINE_KEY = process.env.COST_ENGINE_KEY!;

  export interface Equivalence {
    label: string;
    count: number;
    unit_cost: number;
    source_url: string;
  }

  export interface DenominatorUsed {
    key: string;
    value: number;
    source_url: string;
    last_updated: string;
  }

  export interface CostToNicolasResult {
    amount_eur: number;
    cost_per_citizen: number | null;
    cost_per_taxpayer: number | null;
    cost_per_household: number | null;
    days_of_work_equivalent: number | null;
    equivalences: Equivalence[];
    denominators_used: DenominatorUsed[];
    calculated_at: string;
    cost_per_citizen_unavailable?: boolean;
    cost_per_taxpayer_unavailable?: boolean;
    cost_per_household_unavailable?: boolean;
    days_of_work_unavailable?: boolean;
  }

  export async function calculateCostToNicolas(amountEur: number): Promise<CostToNicolasResult> {
    const response = await fetch(`${COST_ENGINE_URL}/api/cost-to-nicolas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': COST_ENGINE_KEY,
      },
      body: JSON.stringify({ amount_eur: amountEur }),
      signal: AbortSignal.timeout(5000), // 5s timeout (NFR3)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Cost engine error: ${response.status}`);
    }

    return response.json();
  }
  ```

- [ ] Create `src/lib/cost-engine/types.ts` exporting shared TypeScript types for cost calculation results

### Task 5: Database Migration for Cached Results (AC4)
- [ ] Add `costToNicolasResults` JSONB column to the `submissions` table in `src/lib/db/schema.ts`:
  ```typescript
  import { jsonb } from 'drizzle-orm/pg-core';

  // Add to submissions table definition:
  costToNicolasResults: jsonb('cost_to_nicolas_results'),
  ```
- [ ] Run `npx drizzle-kit generate` to create migration adding the JSONB column

### Task 6: Integration with Submission Creation (AC4)
- [ ] Modify the `createSubmission` Server Action in `src/app/submit/actions.ts` to:
  - After successful submission insert, call `calculateCostToNicolas(estimatedCostEur)`
  - Store the result in the `cost_to_nicolas_results` JSONB column along with `calculated_at`
  - If the cost engine call fails (timeout, error), still complete the submission — the cost can be calculated later
  - Log any cost engine failures for monitoring

### Task 7: Python Tests (All ACs)
- [ ] Write `cost-engine/tests/test_cost_calculator.py`:
  - `test_basic_calculation`: 2,000,000,000 EUR returns correct values for all metrics
  - `test_cost_per_citizen_formula`: Verify `amount / 68,373,433 = expected` to 4 decimal places
  - `test_cost_per_taxpayer_formula`: Verify `amount / 18,600,000 = expected` to 4 decimal places
  - `test_cost_per_household_formula`: Verify `amount / 30,400,000 = expected` to 4 decimal places
  - `test_days_of_work_formula`: Verify `cost_per_taxpayer / 62.4658 = expected` to 2 decimal places
  - `test_school_lunch_equivalence`: Verify `cost_per_citizen / 3.50 = expected` to 2 decimal places
  - `test_hospital_bed_equivalence`: Verify `cost_per_citizen / 1400.00 = expected` to 4 decimal places
  - `test_zero_amount_rejected`: `amount_eur = 0` returns 400
  - `test_negative_amount_rejected`: `amount_eur = -100` returns 400
  - `test_missing_denominator_omits_metric`: When `france_population` is None, `cost_per_citizen` is null and `cost_per_citizen_unavailable` is true
  - `test_zero_denominator_omits_metric`: When a denominator value is 0, the metric is omitted
  - `test_remaining_metrics_still_calculated`: With one missing denominator, other metrics still present
  - `test_denominators_used_included`: Response includes all denominators used with source URLs
  - `test_calculated_at_present`: Response includes `calculated_at` ISO timestamp
  - `test_response_time_under_5s`: Calculation completes within 5 seconds
  - `test_large_amount`: 999,999,999,999 EUR calculates correctly
  - `test_small_amount`: 1 EUR calculates correctly

### Task 8: TypeScript Tests (AC4)
- [ ] Write `src/lib/cost-engine/client.test.ts`:
  - `test_calculateCostToNicolas_success`: Mock successful API call returns full result
  - `test_calculateCostToNicolas_timeout`: Mock timeout throws error
  - `test_calculateCostToNicolas_error`: Mock 400 response throws with error message

## Dev Notes

### Architecture & Patterns
- The Cost to Nicolas engine runs in the **Python FastAPI microservice** (`cost-engine/`), called via internal HTTP from the Next.js backend.
- Communication pattern: `Next.js Server Action -> HTTP POST -> FastAPI /api/cost-to-nicolas -> CostCalculator -> Response`
- The calculation result is **cached** in the `submissions.cost_to_nicolas_results` JSONB column to avoid repeated calculations. Subsequent page views read from the cache.
- All calculations use Python `Decimal` for financial precision. No floating-point arithmetic on EUR amounts.

### Exact Calculation Formulas

| Metric | Formula | Denominator Key | Approximate Denominator Value |
|--------|---------|-----------------|-------------------------------|
| Cost per citizen | `amount_eur / france_population` | `france_population` | ~68,373,433 |
| Cost per taxpayer | `amount_eur / income_tax_payers` | `income_tax_payers` | ~18,600,000 |
| Cost per household | `amount_eur / france_households` | `france_households` | ~30,400,000 |
| Days of work equivalent | `cost_per_taxpayer / daily_median_net_income` | `daily_median_net_income` | ~62.47 EUR/day |
| School lunch equivalence | `cost_per_citizen / school_lunch_cost` | `school_lunch_cost` | ~3.50 EUR |
| Hospital bed equivalence | `cost_per_citizen / hospital_bed_day_cost` | `hospital_bed_day_cost` | ~1,400 EUR |

**Worked Example (800,000,000 EUR digital sovereignty plan):**
- Cost per citizen: 800,000,000 / 68,373,433 = **11.7006 EUR**
- Cost per taxpayer: 800,000,000 / 18,600,000 = **43.0108 EUR**
- Cost per household: 800,000,000 / 30,400,000 = **26.3158 EUR**
- Days of work: 43.0108 / 62.4658 = **0.69 days** (~5.5 hours)
- School lunches: 11.7006 / 3.50 = **3.34 repas de cantine scolaire**
- Hospital bed-days: 11.7006 / 1,400 = **0.0084 journee d'hospitalisation**

### Technical Requirements
- **Python Decimal**: All monetary calculations use `decimal.Decimal` with `ROUND_HALF_UP` rounding
- **FastAPI 0.133.1**: Async endpoint with Pydantic v2 request/response models
- **Pydantic Field(gt=0)**: Automatic validation that `amount_eur > 0`
- **5-second timeout**: Next.js client uses `AbortSignal.timeout(5000)` (NFR3)
- **JSONB storage**: Drizzle ORM `jsonb()` column type for PostgreSQL JSONB

### File Structure
```
cost-engine/
  app/
    routers/
      calculations.py                     # NEW - POST /api/cost-to-nicolas endpoint
    services/
      cost_calculator.py                  # MODIFIED - Full implementation
      denominator_service.py              # MODIFIED - Add get_all_as_dict()
    main.py                               # MODIFIED - Add validation error handler
  tests/
    test_cost_calculator.py               # NEW - Comprehensive calculation tests

src/
  lib/
    cost-engine/
      client.ts                           # NEW - HTTP client for FastAPI service
      types.ts                            # NEW - TypeScript types for results
    db/
      schema.ts                           # MODIFIED - Add costToNicolasResults JSONB column
  app/
    submit/
      actions.ts                          # MODIFIED - Call cost engine after submission
```

### Testing Requirements
- **Python (pytest)**: 17+ test cases covering all formulas, edge cases, and error handling
- **Coverage target**: >95% for `cost_calculator.py` (financial accuracy is critical)
- **TypeScript (Vitest)**: Client HTTP integration tests with mocked fetch
- **Test data**: Use the worked example above (800M EUR) as a known-good test case
- **Precision testing**: Verify results to exact decimal places specified in AC1

### UX/Design Notes
- This story has no direct frontend rendering. The calculation results are consumed by:
  - **Story 2.4**: Data Status Page (displays denominators_used)
  - **Story 2.5**: Methodology Page (displays formulas)
  - **Epic 3, Story 3.2**: Submission Detail Page (displays cost breakdown to Nicolas)
  - **Epic 4**: Share Card (displays cost figures in generated image)

### Dependencies
- **Story 2.1** (Waste Submission Form): Provides the `submissions` table that receives the JSONB column
- **Story 2.2** (Denominator Data Pipeline): Provides the denominator values used in calculations
- The calculation endpoint can function independently for testing as long as denominators are seeded

### References
- [Source: epics.md#Epic 2, Story 2.3]
- [Source: architecture.md#Section 5.3 - Cost Engine Structure]
- [Source: architecture.md#Section 3.3 - Python FastAPI Communication]
- [Source: prd.md#FR11, FR12, FR13, FR14, FR15, FR16, NFR3]

## Dev Agent Record

### Agent Model Used
### Completion Notes List
### Change Log
### File List
