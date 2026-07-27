import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'savings']),
  amount: z.number()
    .positive('Importo deve essere positivo')
    .min(0.01, 'Minimo €0.01')
    .max(999999999, 'Importo troppo alto'),
  category: z.string()
    .max(50, 'Categoria troppo lunga')
    .optional(),
  note: z.string()
    .max(500, 'Nota troppo lunga')
    .optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours_worked: z.number().min(0, 'Non può essere negativo').max(100000, 'Troppo alto').optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
