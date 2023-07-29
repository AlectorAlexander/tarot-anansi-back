import { z } from 'zod';

export const notificationsValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  user_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  message: z.string().min(1).max(255).optional(),
  notification_date: z.date().optional(),
  read: z.boolean().optional(),
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
});

export type INotifications = z.infer<typeof notificationsValidationSchema>;
