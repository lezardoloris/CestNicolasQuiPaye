import {
  Landmark, Palette, FlaskConical, MapPin, Factory,
  Monitor, Shield, Briefcase, Leaf, Wheat,
  Building2, Heart, Zap, Train, GraduationCap, Stethoscope,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryDef {
  slug: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: 'Institutions', label: 'Institutions', icon: Landmark, color: 'text-amber-500' },
  { slug: 'Culture', label: 'Culture', icon: Palette, color: 'text-purple-400' },
  { slug: 'Recherche', label: 'Recherche', icon: FlaskConical, color: 'text-cyan-400' },
  { slug: 'Aménagement', label: 'Amenagement', icon: MapPin, color: 'text-orange-400' },
  { slug: 'Industrie', label: 'Industrie', icon: Factory, color: 'text-slate-400' },
  { slug: 'Numérique', label: 'Numerique', icon: Monitor, color: 'text-blue-400' },
  { slug: 'Défense', label: 'Defense', icon: Shield, color: 'text-red-400' },
  { slug: 'Travail', label: 'Travail', icon: Briefcase, color: 'text-yellow-400' },
  { slug: 'Environnement', label: 'Environnement', icon: Leaf, color: 'text-green-400' },
  { slug: 'Agriculture', label: 'Agriculture', icon: Wheat, color: 'text-lime-400' },
  { slug: 'Collectivités', label: 'Collectivites', icon: Building2, color: 'text-indigo-400' },
  { slug: 'Social', label: 'Social', icon: Heart, color: 'text-pink-400' },
  { slug: 'Énergie', label: 'Energie', icon: Zap, color: 'text-yellow-300' },
  { slug: 'Transport', label: 'Transport', icon: Train, color: 'text-teal-400' },
  { slug: 'Éducation', label: 'Education', icon: GraduationCap, color: 'text-violet-400' },
  { slug: 'Santé', label: 'Sante', icon: Stethoscope, color: 'text-rose-400' },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryDef(slug: string | null): CategoryDef | null {
  if (!slug) return null;
  return CATEGORY_MAP.get(slug) ?? null;
}
