import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Abbr } from './abbr';
import { TooltipProvider } from '@/components/ui/tooltip';

// ─── Helpers ─────────────────────────────────────────────────────────────

function renderAbbr(acronym: string, className?: string) {
  return render(
    <TooltipProvider>
      <Abbr a={acronym} className={className} />
    </TooltipProvider>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('Abbr', () => {
  it('affiche un acronyme connu dans un element <abbr>', () => {
    renderAbbr('TVA');
    const abbr = screen.getByText('TVA');
    expect(abbr).toBeInTheDocument();
    expect(abbr.tagName).toBe('ABBR');
  });

  it('ajoute le title avec la definition de l\'acronyme', () => {
    renderAbbr('TVA');
    const abbr = screen.getByText('TVA');
    expect(abbr).toHaveAttribute('title', 'Taxe sur la Valeur Ajoutée');
  });

  it('affiche IR avec la bonne definition', () => {
    renderAbbr('IR');
    const abbr = screen.getByText('IR');
    expect(abbr).toHaveAttribute('title', 'Impôt sur le Revenu');
  });

  it('affiche PIB avec la bonne definition', () => {
    renderAbbr('PIB');
    const abbr = screen.getByText('PIB');
    expect(abbr).toHaveAttribute('title', 'Produit Intérieur Brut');
  });

  it('affiche le texte brut pour un acronyme inconnu (pas de <abbr>)', () => {
    renderAbbr('XYZ');
    expect(screen.getByText('XYZ')).toBeInTheDocument();
    // Pas d'element <abbr>, juste le texte nu
    const element = screen.getByText('XYZ');
    expect(element.tagName).not.toBe('ABBR');
  });

  it('applique la classe CSS personnalisee', () => {
    renderAbbr('CSG', 'custom-class');
    const abbr = screen.getByText('CSG');
    expect(abbr).toHaveClass('custom-class');
  });

  it('a la classe cursor-help par defaut pour les acronymes connus', () => {
    renderAbbr('SMIC');
    const abbr = screen.getByText('SMIC');
    expect(abbr).toHaveClass('cursor-help');
  });

  it('affiche SNCF avec la bonne definition', () => {
    renderAbbr('SNCF');
    const abbr = screen.getByText('SNCF');
    expect(abbr).toHaveAttribute(
      'title',
      'Société Nationale des Chemins de fer Français',
    );
  });

  it('affiche INSEE avec la bonne definition', () => {
    renderAbbr('INSEE');
    const abbr = screen.getByText('INSEE');
    expect(abbr).toHaveAttribute(
      'title',
      'Institut National de la Statistique et des Études Économiques',
    );
  });
});
