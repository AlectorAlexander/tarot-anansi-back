import { z } from 'zod';

// Expressão regular para validar números de telefone no formato (XX) XXXXX-XXXX
const phoneRegExp = /^\(\d{2}\) \d{5}-\d{4}$/;

// Função de validação personalizada para números de telefone
const phoneNumberValidator = (value: string) => {
  if (!phoneRegExp.test(value)) {
    throw new Error('Número de telefone inválido');
  }
  return value;
};

export const userValidationSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid _id format.')
    .optional(),
  role: z.enum(['user', 'admin']),
  name: z.string().min(2, 'Name must be at least 2 characters long.').max(50),
  email: z.string().email('Invalid email format.').min(5).max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(255)
    .optional(),
  profile_photo: z.string().optional(),
  google_id: z.string().optional(),
  facebook_id: z.string().optional(),
  phone: z
    .string()
    .refine(phoneNumberValidator, {
      message: 'Número de telefone inválido',
    })
    .optional(), // Adicionando validação para número de telefone
  date_creation: z.date().optional(),
  date_update: z.date().optional(),
});

export type IUser = z.infer<typeof userValidationSchema>;
