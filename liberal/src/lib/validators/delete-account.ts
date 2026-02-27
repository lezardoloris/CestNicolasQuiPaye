import { z } from 'zod';

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine(
      (val) => val === 'SUPPRIMER',
      'Veuillez taper exactement SUPPRIMER pour confirmer',
    ),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
