import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SalaryInput } from './SalaryInput';
import { REFERENCE_SALARIES } from '@/lib/constants/tax-2026';

// ─── Mocks ───────────────────────────────────────────────────────────────

// Mock the Slider component since Radix primitives don't work in jsdom
vi.mock('@/components/ui/slider', () => ({
  Slider: (props: Record<string, unknown>) => (
    <input
      type="range"
      data-testid="salary-slider"
      id={props.id as string}
      min={props.min as number}
      max={props.max as number}
      step={props.step as number}
      value={Array.isArray(props.value) ? (props.value as number[])[0] : 0}
      onChange={(e) => {
        const fn = props.onValueChange as (v: number[]) => void;
        if (fn) fn([parseInt(e.target.value, 10)]);
      }}
      aria-label={props['aria-label'] as string}
    />
  ),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────

function renderSalaryInput(value = 30000, onChange?: (v: number) => void) {
  const mockOnChange = onChange ?? vi.fn();
  return {
    ...render(<SalaryInput value={value} onChange={mockOnChange} />),
    mockOnChange,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('SalaryInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le label "Salaire brut annuel"', () => {
    renderSalaryInput();
    expect(screen.getByText('Salaire brut annuel')).toBeInTheDocument();
  });

  it('affiche le montant formate en EUR', () => {
    renderSalaryInput(30000);
    // formatEUR(30000) -> "30 000 €" (avec espaces insecables possibles)
    expect(screen.getByText(/30[\s\u202f]?000/)).toBeInTheDocument();
  });

  it('affiche "/an" apres le montant', () => {
    renderSalaryInput();
    expect(screen.getByText('/an')).toBeInTheDocument();
  });

  it('affiche les bornes du slider (0 € et 200 000 €)', () => {
    renderSalaryInput();
    expect(screen.getByText('0 €')).toBeInTheDocument();
    expect(screen.getByText(/200[\s\u202f]?000\s*€/)).toBeInTheDocument();
  });

  it('affiche les boutons rapides SMIC, Median, Moyen', () => {
    renderSalaryInput();
    expect(screen.getByRole('button', { name: 'SMIC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Médian' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Moyen' })).toBeInTheDocument();
  });

  it('appelle onChange avec la valeur SMIC quand on clique sur le bouton SMIC', () => {
    const { mockOnChange } = renderSalaryInput();
    fireEvent.click(screen.getByRole('button', { name: 'SMIC' }));
    expect(mockOnChange).toHaveBeenCalledWith(REFERENCE_SALARIES.smic);
  });

  it('appelle onChange avec la valeur Median quand on clique sur le bouton Median', () => {
    const { mockOnChange } = renderSalaryInput();
    fireEvent.click(screen.getByRole('button', { name: 'Médian' }));
    expect(mockOnChange).toHaveBeenCalledWith(REFERENCE_SALARIES.median);
  });

  it('appelle onChange avec la valeur Moyen quand on clique sur le bouton Moyen', () => {
    const { mockOnChange } = renderSalaryInput();
    fireEvent.click(screen.getByRole('button', { name: 'Moyen' }));
    expect(mockOnChange).toHaveBeenCalledWith(REFERENCE_SALARIES.moyen);
  });

  it('affiche le champ de saisie numerique avec le bon aria-label', () => {
    renderSalaryInput();
    expect(
      screen.getByRole('spinbutton', { name: 'Saisir un montant exact' }),
    ).toBeInTheDocument();
  });

  it('le champ numerique contient la valeur actuelle', () => {
    renderSalaryInput(45000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    expect(input).toHaveValue(45000);
  });

  it('appelle onChange quand on saisit une valeur valide dans le champ numerique', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: '50000' } });
    expect(mockOnChange).toHaveBeenCalledWith(50000);
  });

  it('n\'appelle pas onChange pour une valeur non numerique', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('n\'appelle pas onChange pour une valeur negative', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: '-1000' } });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('n\'appelle pas onChange pour une valeur superieure a 200 000', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: '300000' } });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('accepte la valeur 0 dans le champ numerique', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: '0' } });
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('accepte la valeur maximale 200000 dans le champ numerique', () => {
    const { mockOnChange } = renderSalaryInput(30000);
    const input = screen.getByRole('spinbutton', {
      name: 'Saisir un montant exact',
    });
    fireEvent.change(input, { target: { value: '200000' } });
    expect(mockOnChange).toHaveBeenCalledWith(200000);
  });

  it('affiche le slider', () => {
    renderSalaryInput();
    expect(screen.getByTestId('salary-slider')).toBeInTheDocument();
  });

  it('le slider a les bons attributs min/max/step', () => {
    renderSalaryInput();
    const slider = screen.getByTestId('salary-slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '200000');
    expect(slider).toHaveAttribute('step', '500');
  });
});
