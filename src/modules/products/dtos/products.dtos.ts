import { z } from 'zod';

export const productValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  duracao: z.string().optional(),
  price: z.number().min(0.01).max(999999.99).optional(),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
  stripe_id: z.string().optional(),
});

export type IProduct = z.infer<typeof productValidationSchema>;
