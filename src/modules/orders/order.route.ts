import { Router } from "express";
import orderController from "./order.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import Midtrans from "midtrans-client";

const router = Router();

router.post("/order/add-orders", authMiddleware, orderController.createOrder);
router.get(
  "/order/get-all-transactions",
  authMiddleware,
  orderController.handleGetAllTransactions,
);

router.get(
  "/order/get-highlight-transactions",
  authMiddleware,
  orderController.handleGetHighlightTransactions,
);

router.get(
  "/order/get-chart-transactions",
  authMiddleware,
  orderController.handleGetChartTransactions,
);

router.post(
  "/midtrans/transactions",
  authMiddleware,
  orderController.handleTransactionMidtrans,
);

export default router;
