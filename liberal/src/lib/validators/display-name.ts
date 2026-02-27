import { z } from 'zod';

const FORBIDDEN_STRINGS = [
  'admin',
  'moderat',
  'liberal',
  'liberale',
  'libéral',
  'libérale',
];

export const displayNameSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Le pseudonyme doit contenir au moins 2 caracteres')
    .max(100, 'Le pseudonyme ne peut pas depasser 100 caracteres')
    .refine(
      (name) =>
        !FORBIDDEN_STRINGS.some((forbidden) =>
          name.toLowerCase().includes(forbidden),
        ),
      'Ce pseudonyme contient un terme reserve',
    )
    .refine(
      (name) => /^[a-zA-Z0-9\u00C0-\u024F\s._-]+$/.test(name),
      'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, points, tirets et underscores',
    ),
});

export type DisplayNameInput = z.infer<typeof displayNameSchema>;
