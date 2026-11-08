import z from "zod";

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "username atau password salah!"),
    password: z.string().min(8, "username atau password salah!"),
  }),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(1, "username tidak boleh kosong!"),
    password: z.string().min(8, "password minimal 8 karakter!"),
  }),
});
export type RegisterSchema = z.infer<typeof registerSchema>;

export const addUserTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "nama user type tidak boleh kosong!"),
  }),
});
export type AddUserTypeSchema = z.infer<typeof addUserTypeSchema>;

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "password lama salah!"),
    newPassword: z.string().min(8, "password minimal 8 karakter!"),
    confirmPassword: z.string().min(8, "password minimal 8 karakter!"),
  }),
});
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
