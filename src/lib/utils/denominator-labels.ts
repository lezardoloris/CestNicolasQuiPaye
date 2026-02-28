export const DENOMINATOR_LABELS: Record<
  string,
  {
    label: string;
    unit: string;
    formatType: 'integer' | 'currency' | 'decimal';
  }
> = {
  france_population: {
    label: 'Population francaise',
    unit: 'habitants',
    formatType: 'integer',
  },
  income_tax_payers: {
    label: "Contribuables a l'impot sur le revenu",
    unit: 'foyers fiscaux',
    formatType: 'integer',
  },
  france_households: {
    label: 'Nombre de menages',
    unit: 'menages',
    formatType: 'integer',
  },
  daily_median_net_income: {
    label: 'Revenu net median journalier',
    unit: 'EUR/jour',
    formatType: 'currency',
  },
  school_lunch_cost: {
    label: 'Cout moyen repas cantine scolaire',
    unit: 'EUR/repas',
    formatType: 'currency',
  },
  hospital_bed_day_cost: {
    label: "Cout moyen journee d'hospitalisation",
    unit: 'EUR/jour',
    formatType: 'currency',
  },
};
