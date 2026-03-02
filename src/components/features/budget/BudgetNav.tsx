'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ArrowUp } from 'lucide-react';

const sections = [
  { id: 'deficit', label: 'Déficit' },
  { id: 'depenses-publiques', label: 'Dépenses publiques' },
  { id: 'budget-etat', label: 'Budget de l\'État' },
  { id: 'protection-sociale', label: 'Social & Fraude' },
  { id: 'prospective', label: 'Prospective dette' },
  { id: 'impot-revenu', label: 'Impôt sur le revenu' },
  { id: 'remunerations', label: 'Rémunérations' },
  { id: 'associations', label: 'Associations' },
  { id: 'agences', label: 'Agences de l\'État' },
  { id: 'france-ue', label: 'France & UE' },
  { id: 'sources', label: 'Sources' },
];

export function BudgetNav() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, close]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      close();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Sticky dropdown nav — top-12 matches mobile h-12 header, md:top-16 matches desktop h-16 */}
      <div className="sticky top-12 z-40 -mx-4 px-4 pb-2 pt-2 backdrop-blur-sm md:top-16">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-haspopup="true"
            className="flex w-full items-center justify-between rounded-lg border border-border-default bg-surface-secondary px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated"
          >
            <span>Aller à une section</span>
            <ChevronDown
              aria-hidden="true"
              className={`size-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <div
              role="menu"
              className="absolute top-full left-0 right-0 mt-1 overflow-hidden rounded-lg border border-border-default bg-surface-secondary shadow-lg"
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="menuitem"
                  onClick={() => scrollTo(s.id)}
                  className="block w-full px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="fixed right-4 bottom-20 z-50 flex size-12 items-center justify-center rounded-full border border-border-default bg-surface-secondary shadow-lg transition-colors hover:bg-surface-elevated md:bottom-6"
        aria-label="Retour en haut"
      >
        <ArrowUp aria-hidden="true" className="size-4 text-text-primary" />
      </button>
    </>
  );
}
