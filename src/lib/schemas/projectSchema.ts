import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string()
    .min(3, 'Nome troppo corto (min 3 caratteri)')
    .max(100, 'Nome troppo lungo (max 100 caratteri)')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Solo lettere, numeri, spazi e trattini'),
  industry: z.string().max(50).optional(),
  description: z.string().max(500, 'Descrizione troppo lunga').optional(),
  target_revenue: z.number().positive('Deve essere positivo').optional(),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
