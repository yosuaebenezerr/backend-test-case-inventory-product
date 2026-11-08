import { Router } from "express";
import productController from "./product.controller.js";
import validateResource from "../../middlewares/validate.middleware.js";
import { addProductSchema } from "./product.schema.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/category/add-category",
  authMiddleware,
  productController.handleAddCategory,
);

router.get(
  "/category/get-category",
  authMiddleware,
  productController.handleGetCategory,
);

router.post(
  "/product/add-product",
  authMiddleware,
  upload.array("photoProduct", 5),
  validateResource(addProductSchema),
  productController.handleAddProduct,
);

router.put(
  "/product/edit-category/:categoryId",
  authMiddleware,
  productController.handleEditCategory,
);

router.put(
  "/product/edit-product/:productId",
  authMiddleware,
  upload.array("photoProduct", 5),
  validateResource(addProductSchema),
  productController.handleEditProduct,
);

router.put(
  "/product/edit-stock/:productId",
  authMiddleware,
  productController.handleEditStock,
);

router.post(
  "/product/add-stock/:productId",
  authMiddleware,
  productController.handleAddStock,
);

router.get(
  "/product/search/get-all-products",
  authMiddleware,
  productController.getAllProduct,
);

router.get(
  "/product/all-products-status",
  authMiddleware,
  productController.handleGetAllProductStatus,
);

router.get(
  "/product/10-products-available",
  authMiddleware,
  productController.handleGet10ProductsAvailable,
);

router.get(
  "/product/10-products-not-available",
  authMiddleware,
  productController.handleGet10ProductsNotAvailable,
);

// router.get(
//   "/product/best-seller-products",
//   authMiddleware,
//   productController.handleGetProductBestSeller,
// );

export default router;
