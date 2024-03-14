import { ObjectId } from 'mongodb';
import { z } from 'zod';

const idSchema = z
  .custom((input) => {
    if (typeof input === 'string' && /^[0-9a-fA-F]{24}$/.test(input)) {
      return true; // Permitir strings que se pareçam com ObjectIds
    }
    if (input instanceof ObjectId) {
      return true; // Permitir instâncias de ObjectId
    }
    return false; // Rejeitar qualquer outra coisa
  })
  .transform((input) => (input instanceof ObjectId ? input.toString() : input));

export const paymentsValidationSchema = z.object({
  _id: idSchema.optional(),
  schedule_id: idSchema.optional(),
  price: z.number().min(0.01).max(999999.99).optional(),
  status: z.enum(['pendente', 'pago', 'cancelado', 'reembolsado']).optional(),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
  paymentIntentId: z.string().optional(),
});

export type IPayments = z.infer<typeof paymentsValidationSchema>;
