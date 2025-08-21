import { z } from 'zod';
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['customer', 'owner']).default('customer')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
