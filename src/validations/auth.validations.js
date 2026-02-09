const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "El nombre de usuario es obligatorio" }).min(4).max(20),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    cuit_empresa: z.string().length(11, "El CUIT debe tener 11 dígitos").regex(/^\d+$/, "Solo se permiten números"),
    role: z.enum(['admin', 'viewer']).default('viewer')
  })
});

const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "El usuario es requerido"),
    password: z.string().min(1, "La contraseña es requerida")
  })
});

module.exports = { signupSchema, loginSchema };