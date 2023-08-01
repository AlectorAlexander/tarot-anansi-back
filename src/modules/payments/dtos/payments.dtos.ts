import { z } from 'zod';

export const paymentsValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  schedule_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  price: z.number().min(0.01).max(999999.99).optional(),
  status: z.enum(['pendente', 'pago', 'cancelado', 'reembolsado']),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
});

export type IPayments = z.infer<typeof paymentsValidationSchema>;
