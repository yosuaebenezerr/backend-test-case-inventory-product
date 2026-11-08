import z from "zod";

export const addCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "nama category tidak boleh kosong!"),
  }),
});
export type AddCategorySchema = z.infer<typeof addCategorySchema>;

export const addProductSchema = z.object({
  body: z.object({
    nameProduct: z.string().trim().min(1, "nama product tidak boleh kosong!"),
    categoryId: z.string().min(1, "category tidak boleh kosong!").trim(),
    quantity: z.coerce
      .number()
      .int("Stock harus berupa bilangan bulat!")
      .min(1, "Stock minimal 1!"),
    codeProduct: z.string().trim().min(1, "code product tidak boleh kosong!"),
  }),
});

export const photoProductSchema = z
  .array(
    z.object({
      mimetype: z
        .string()
        .regex(
          /^image\/(jpeg|png|webp)$/,
          "Format foto harus JPEG, PNG, atau WEBP!",
        ),

      size: z.number().max(5 * 1024 * 1024, "Ukuran foto maksimal 5 MB!"),
    }),
  )
  .min(1, "Minimal upload 1 foto!")
  .max(5, "Maksimal upload 5 foto!");

export type AddProductSchema = z.infer<typeof addProductSchema>;
