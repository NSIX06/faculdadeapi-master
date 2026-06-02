import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("invalid email format"),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("invalid email format").optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
