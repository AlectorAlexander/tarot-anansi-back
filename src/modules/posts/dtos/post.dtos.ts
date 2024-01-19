import { z } from 'zod';

export const postValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: z.string().optional(),
  image: z.string().optional(),
  content: z.string().optional(),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
});

export type IPost = z.infer<typeof postValidationSchema>;
