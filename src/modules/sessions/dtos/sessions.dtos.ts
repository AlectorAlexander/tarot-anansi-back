import { z } from 'zod';

export const sessionsValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  schedule_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  date: z.string().optional(),
  price: z.number().min(0.01).max(999999.99).optional(),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
});

export type ISessions = z.infer<typeof sessionsValidationSchema>;
