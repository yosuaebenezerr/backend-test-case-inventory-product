import productRepository from "./product.repository.js";

const productService = {
  getAllProductStatus: async ({
    userId,
    status,
    category,
    nameProduct,
  }: {
    userId: string;
    status: "tersedia" | "tidak_tersedia";
    category: string;
    nameProduct: string;
  }) => {
    const products = await productRepository.getAllProductsStatus({
      userId,
      status,
      category,
      nameProduct,
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

    return mappedProducts;
  },

  get10ProductsAvailable: async ({ userId }: { userId: string }) => {
    const products = await productRepository.get10ProductsAvailable({
      userId,
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
    return mappedProducts;
  },

  get10ProductsNotAvailable: async ({ userId }: { userId: string }) => {
    const products = await productRepository.get10ProductsNotAvailable({
      userId: userId!,
    });
    const mappedProducts = products.map((p) => {
      return {
        id: p.id,
        name: p.nameProduct,
        stock: p.productStock
          .map((stock) => stock.quantity)
          .reduce((a, b) => a + b, 0),
        category: p.category.name,
      };
    });

    return mappedProducts;
  },

  // getBestSellerProducts: async ({ userId }: { userId: string }) => {
  //   const products = await productRepository.getProductBestSeller({
  //     userId: userId,
  //   });

  //   const mappedProducts = products.map((p) => p.productId);

  //   const dataBestSeller = await prisma.product.findMany({
  //     where: { id: { in: mappedProducts } },
  //     select: {
  //       id: true,
  //       name: true,
  //       priceSell: true,
  //       profit: true,
  //       stock: true,
  //       category: {
  //         select: {
  //           name: true,
  //         },
  //       },
  //     },
  //   });

  //   return products.map((item) => ({
  //     id: item.productId,
  //     totalSold: item._sum.quantity,
  //     name: dataBestSeller.find((products) => products.id === item.productId)
  //       ?.name,
  //     priceSell: dataBestSeller.find((p) => p.id === item.productId)?.priceSell,
  //     profit: dataBestSeller.find((p) => p.id === item.productId)?.profit,
  //     stock: dataBestSeller.find((p) => p.id === item.productId)?.stock,
  //     category: dataBestSeller.find((p) => p.id === item.productId)?.category
  //       .name,
  //   }));
  // },
};

export default productService;
