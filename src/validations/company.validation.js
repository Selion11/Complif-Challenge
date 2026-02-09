const { z } = require('zod');

const createCompanySchema = z.object({
  body: z.object({
    name: z.string({ required_error: "El nombre es obligatorio" }).min(3).max(100),
    cuit: z.string().length(11, "El CUIT debe tener exactamente 11 dígitos").regex(/^\d+$/, "El CUIT solo debe contener números"),
    country: z.string().min(2).max(50),
    industry: z.string().min(2).max(50),
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], { 
      error_map: () => ({ message: "El estado debe ser PENDING, APPROVED o REJECTED" }) 
    }),
    comment: z.string().min(5, "El comentario de auditoría debe ser más extenso").max(255)
  })
});

module.exports = { createCompanySchema, updateStatusSchema };