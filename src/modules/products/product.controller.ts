import { NextFunction, Request, Response } from "express";
import {
  AddCategorySchema,
  AddProductSchema,
  photoProductSchema,
} from "./product.schema.js";
import productRepository from "./product.repository.js";
import productService from "./product.service.js";
import { codec } from "zod";

const productController = {
  handleAddCategory: async (
    req: Request<{}, {}, AddCategorySchema["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id;
    const { name } = req.body;

    try {
      await productRepository.addCategory({ userId: userId!, name });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Category berhasil ditambahkan",
      });
    } catch (error) {
      next(error);
    }
  },

  handleGetCategory: async (
    req: Request<{}, {}, { name?: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const name = req.query.name as string;
      const categories = await productRepository.getCategory({
        userId: userId!,
        name: name,
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan kategori",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  handleEditCategory: async (
    req: Request<{ categoryId: string }, {}, { name: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    try {
      await productRepository.editCategory({ categoryId, name });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Category berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  },

  getAllProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const search = req.query.search as string | undefined;

      const products = await productRepository.getAllProduct({
        userId: userId!,
        search: search!,
      });

      const mappedProducts = products.map((p) => {
        return {
          id: p.id,
          name: p.nameProduct,
          stock: p.productStock
            .map((stock) => stock.quantity)
            .reduce((a, b) => a + b, 0),
          category: p.category.name,
          codeProduct: p.codeProduct,
          photoProduct: p.photoProduct,
        };
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan semua produk",
        data: mappedProducts,
      });
    } catch (error) {
      next(error);
    }
  },

  handleGetAllProductStatus: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const status = req.query.status as "tersedia" | "tidak_tersedia";
      const category = req.query.category as string;
      const nameProduct = req.query.nameProduct as string;

      const response = await productService.getAllProductStatus({
        userId: userId!,
        status,
        category,
        nameProduct,
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan semua produk yang tersedia",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },

  handleAddProduct: async (
    req: Request<{}, {}, AddProductSchema["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const { categoryId, codeProduct, nameProduct, quantity } = req.body;
    const userId = req.user?.id;

    const files = (req.files as Express.Multer.File[]) ?? [];

    const fileValidation = photoProductSchema.safeParse(files);

    if (!fileValidation.success) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Validasi file gagal",
        data: fileValidation.error.flatten(),
      });
    }

    const photoProduct: string[] = files.map((file) =>
      file.path.replace(/\\/g, "/"),
    );

    try {
      await productRepository.addProduct({
        userId: userId!,
        photoProduct,
        payload: {
          codeProduct,
          nameProduct,
          categoryId,
          quantity,
        },
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Product berhasil ditambahkan",
      });
    } catch (error) {
      next(error);
    }
  },

  handleEditProduct: async (
    req: Request<{ productId: string }, {}, AddProductSchema["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const { productId } = req.params;
    const { categoryId, codeProduct, nameProduct, quantity } = req.body;

    const files = (req.files as Express.Multer.File[]) ?? [];

    const fileValidation = photoProductSchema.safeParse(files);

    if (!fileValidation.success) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Validasi file gagal",
        data: fileValidation.error.flatten(),
      });
    }

    const photoProduct: string[] = files.map((file) =>
      file.path.replace(/\\/g, "/"),
    );

    try {
      await productRepository.editProduct({
        productId,
        payload: {
          codeProduct,
          nameProduct,
          categoryId,
          quantity: Number(quantity),
        },
        photoProduct,
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Product berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  },

  handleEditStock: async (
    req: Request<{ productId: string }, {}, { stock: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { productId } = req.params;
    const { stock } = req.body;

    try {
      await productRepository.editStockProduct({
        productId,
        stock,
      });

      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Stock berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  },

  handleAddStock: async (
    req: Request<{ productId: string }, {}, { stock: number }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { productId } = req.params;
    const { stock } = req.body;

    try {
      await productRepository.addStock({ productId, stock });
      return res.status(201).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Stock berhasil ditambahkan",
      });
    } catch (error) {
      next(error);
    }
  },

  handleGet10ProductsAvailable: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({
          status: "error",
          statusCode: res.statusCode,
          message: "User ID tidak ditemukan",
        });
      }

      const products = await productService.get10ProductsAvailable({
        userId,
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan 10 produk yang tersedia",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  handleGet10ProductsNotAvailable: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({
          status: "error",
          statusCode: res.statusCode,
          message: "User ID tidak ditemukan",
        });
      }

      const products = await productService.get10ProductsNotAvailable({
        userId,
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Berhasil mendapatkan 10 produk yang tidak tersedia",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // handleGetProductBestSeller: async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) => {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       return res.status(400).json({
  //         status: "error",
  //         statusCode: res.statusCode,
  //         message: "User ID tidak ditemukan",
  //       });
  //     }
  //     const bestSeller = await productService.getBestSellerProducts({ userId });

  //     return res.status(200).json({
  //       status: "success",
  //       statusCode: res.statusCode,
  //       message: "Berhasil mendapatkan produk best seller",
  //       data: bestSeller,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
};

export default productController;
