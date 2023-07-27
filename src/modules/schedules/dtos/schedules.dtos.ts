import { z } from "zod";

export const schedulesValidationSchema = z.object({
    _id: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    user_id: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    start_date: z.date().optional(),
    status: z.enum(['pendente', 'confirmado', 'cancelado', 'concluído']),
    end_date: z.date().optional(),
    date_creation: z.date().optional(),
    date_update: z.date().optional(),
})

export type ISchedules = z.infer<typeof schedulesValidationSchema>;
