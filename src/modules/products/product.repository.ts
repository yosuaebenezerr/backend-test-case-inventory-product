import prisma from "../../db/index.js";
import { AddProductSchema } from "./product.schema.js";

const productRepository = {
  addCategory: async ({ userId, name }: { userId: string; name: string }) => {
    const response = await prisma.category.create({
      data: { userId, name },
    });
    return response;
  },

  getCategory: async ({ userId, name }: { userId: string; name: string }) => {
    return await prisma.category.findMany({
      where: {
        userId,
        OR: [
          {
            name: {
              contains: name,
              mode: "insensitive" as const,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });
  },

  editCategory: async ({
    categoryId,
    name,
  }: {
    categoryId: string;
    name: string;
  }) => {
    const response = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });
    return response;
  },

  addProduct: async ({
    userId,
    payload,
    photoProduct,
  }: {
    userId: string;
    payload: AddProductSchema["body"];
    photoProduct: string[];
  }) => {
    const { nameProduct, categoryId, quantity, codeProduct } = payload;

    const response = await prisma.product.create({
      data: {
        userId,
        nameProduct,
        categoryId,
        photoProduct: {
          create: photoProduct.map((url) => ({ photoUrl: url })),
        },
        codeProduct,
        productStock: {
          create: {
            quantity: Number(quantity),
          },
        },
      },
    });
    return response;
  },

  editProduct: async ({
    payload,
    productId,
    photoProduct,
  }: {
    payload: AddProductSchema["body"];
    productId: string;
    photoProduct: string[];
  }) => {
    const { categoryId, codeProduct, nameProduct, quantity } = payload;

    const response = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        codeProduct,
        nameProduct,
        photoProduct: {
          deleteMany: {},
          create: photoProduct.map((url) => ({ photoUrl: url })),
        },
        productStock: {
          create: {
            quantity: Number(quantity),
          },
        },
        categoryId,
      },
    });
    return response;
  },

  editStockProduct: async ({
    productId,
    stock,
  }: {
    productId: string;
    stock: number;
  }) => {
    return await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        productStock: {
          create: {
            quantity: stock,
          },
        },
      },
    });
  },

  get10ProductsAvailable: async ({ userId }: { userId: string }) => {
    return await prisma.product.findMany({
      where: {
        userId,
        productStock: {
          some: {
            quantity: {
              gt: 0,
            },
          },
        },
      },
      select: {
        id: true,
        codeProduct: true,
        nameProduct: true,
        photoProduct: true,
        category: {
          select: {
            name: true,
          },
        },
        productStock: {
          select: {
            quantity: true,
          },
        },
      },
      take: 10,
    });
  },

  get10ProductsNotAvailable: async ({ userId }: { userId: string }) => {
    return await prisma.product.findMany({
      where: {
        userId,
        productStock: {
          some: {
            quantity: {
              equals: 0,
            },
          },
        },
      },
      select: {
        id: true,
        codeProduct: true,
        nameProduct: true,
        photoProduct: true,
        category: {
          select: {
            name: true,
          },
        },
        productStock: {
          select: {
            quantity: true,
          },
        },
      },
      take: 10,
    });
  },

  getAllProduct: async ({
    search,
    userId,
  }: {
    search?: string;
    userId: string;
  }) => {
    return await prisma.product.findMany({
      where: {
        userId,
        OR: [
          {
            nameProduct: {
              contains: search!,
              mode: "insensitive" as const,
            },
          },
          {
            category: {
              name: {
                contains: search!,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        codeProduct: true,
        nameProduct: true,
        photoProduct: true,
        category: {
          select: {
            name: true,
          },
        },
        productStock: {
          select: {
            quantity: true,
          },
        },
      },
    });
  },

  getAllProductsStatus: async ({
    userId,
    status,
    category,
    nameProduct,
  }: {
    userId: string;
    status?: "tersedia" | "tidak_tersedia";
    category?: string;
    nameProduct?: string;
  }) => {
    const whereCondition = {
      userId,
      ...(status === "tersedia" && {
        productStock: { some: { quantity: { gt: 0 } } },
      }),
      ...(status === "tidak_tersedia" && {
        productStock: { some: { quantity: { equals: 0 } } },
      }),
    };

    return await prisma.product.findMany({
      where: {
        ...whereCondition,
        ...(category && { category: { name: category } }),
        ...(nameProduct && {
          nameProduct: {
            contains: nameProduct,
            mode: "insensitive" as const,
          },
        }),
      },
      select: {
        id: true,
        codeProduct: true,
        nameProduct: true,
        photoProduct: true,
        category: {
          select: {
            name: true,
          },
        },
        productStock: {
          select: {
            quantity: true,
          },
        },
      },
    });
  },

  // getProductBestSeller: async ({ userId }: { userId: string }) => {
  //   return await prisma.transactionProductSell.groupBy({
  //     where: {
  //       transaction: {
  //         userId,
  //       },
  //     },
  //     by: ["productId"],
  //     _sum: {
  //       quantity: true,
  //     },
  //     orderBy: {
  //       _sum: {
  //         quantity: "desc",
  //       },
  //     },
  //     take: 10,
  //   });
  // },

  addStock: async ({
    productId,
    stock,
  }: {
    productId: string;
    stock: number;
  }) => {
    const response = await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
    return response;
  },
};

export default productRepository;
