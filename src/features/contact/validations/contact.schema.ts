import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .max(50, { message: "El nombre no debe exceder los 50 caracteres." }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido." })
    .email({ message: "Dirección de correo electrónico inválida." }),
  phone: z
    .string()
    .optional()
    .or(z.literal("")), // Permite campo vacío
  company: z
    .string()
    .min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." })
    .max(100, { message: "El nombre de la empresa no debe exceder los 100 caracteres." }),
  serviceOfInterest: z
    .string()
    .min(1, { message: "Por favor, selecciona un servicio de interés." }),
  message: z
    .string()
    .min(10, { message: "Los detalles del proyecto deben tener al menos 10 caracteres." })
    .max(1000, { message: "Los detalles del proyecto no deben exceder los 1000 caracteres." }),
  // Campo honeypot anti-spam: debe llegar vacío.
  // Los bots suelen rellenar todos los campos — si tiene valor, es un bot.
  _honey: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

