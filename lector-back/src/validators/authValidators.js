import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'El nombre es obligatorio' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: z
      .string({ required_error: 'El correo electrónico es obligatorio' })
      .trim()
      .toLowerCase()
      .email('Ingrese un correo electrónico válido'),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(128, 'La contraseña no puede exceder 128 caracteres'),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'El correo electrónico es obligatorio' })
      .trim()
      .toLowerCase()
      .email('Ingrese un correo electrónico válido'),
    password: z
      .string({ required_error: 'La contraseña es obligatoria' })
      .min(1, 'La contraseña no puede estar vacía'),
  }),
})

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
})
