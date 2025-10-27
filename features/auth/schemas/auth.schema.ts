import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ message: "Email requis" }).email({ message: "Adresse email invalide" }),
  password: z.string({ message: "Mot de passe requis" }).min(6, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

export type LoginDTO = z.infer<typeof loginSchema>;