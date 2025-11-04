import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Minimo 8 caratteri')
  .regex(/[A-Z]/, 'Almeno una maiuscola')
  .regex(/[a-z]/, 'Almeno una minuscola')
  .regex(/[0-9]/, 'Almeno un numero')
  .regex(/[^A-Za-z0-9]/, 'Almeno un carattere speciale');

export const authSignUpSchema = z.object({
  email: z.string().email('Email non valida'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Nome troppo corto'),
});

export const authSignInSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password richiesta'),
});

export type AuthSignUpFormData = z.infer<typeof authSignUpSchema>;
export type AuthSignInFormData = z.infer<typeof authSignInSchema>;
