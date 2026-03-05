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
  bgColor: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: 'Institutions', label: 'Institutions', icon: Landmark, color: 'text-amber-500', bgColor: 'bg-amber-500/15' },
  { slug: 'Culture', label: 'Culture', icon: Palette, color: 'text-purple-400', bgColor: 'bg-purple-400/15' },
  { slug: 'Recherche', label: 'Recherche', icon: FlaskConical, color: 'text-cyan-400', bgColor: 'bg-cyan-400/15' },
  { slug: 'Aménagement', label: 'Amenagement', icon: MapPin, color: 'text-orange-400', bgColor: 'bg-orange-400/15' },
  { slug: 'Industrie', label: 'Industrie', icon: Factory, color: 'text-slate-400', bgColor: 'bg-slate-400/15' },
  { slug: 'Numérique', label: 'Numerique', icon: Monitor, color: 'text-blue-400', bgColor: 'bg-blue-400/15' },
  { slug: 'Défense', label: 'Defense', icon: Shield, color: 'text-red-400', bgColor: 'bg-red-400/15' },
  { slug: 'Travail', label: 'Travail', icon: Briefcase, color: 'text-yellow-400', bgColor: 'bg-yellow-400/15' },
  { slug: 'Environnement', label: 'Environnement', icon: Leaf, color: 'text-green-400', bgColor: 'bg-green-400/15' },
  { slug: 'Agriculture', label: 'Agriculture', icon: Wheat, color: 'text-lime-400', bgColor: 'bg-lime-400/15' },
  { slug: 'Collectivités', label: 'Collectivites', icon: Building2, color: 'text-indigo-400', bgColor: 'bg-indigo-400/15' },
  { slug: 'Social', label: 'Social', icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-400/15' },
  { slug: 'Énergie', label: 'Energie', icon: Zap, color: 'text-yellow-300', bgColor: 'bg-yellow-300/15' },
  { slug: 'Transport', label: 'Transport', icon: Train, color: 'text-teal-400', bgColor: 'bg-teal-400/15' },
  { slug: 'Éducation', label: 'Education', icon: GraduationCap, color: 'text-violet-400', bgColor: 'bg-violet-400/15' },
  { slug: 'Santé', label: 'Sante', icon: Stethoscope, color: 'text-rose-400', bgColor: 'bg-rose-400/15' },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryDef(slug: string | null): CategoryDef | null {
  if (!slug) return null;
  return CATEGORY_MAP.get(slug) ?? null;
}
