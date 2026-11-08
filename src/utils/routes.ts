import express from "express";
import authRouter from "../modules/auth/auth.route.js";
import productRouter from "../modules/products/product.route.js";
import orderRouter from "../modules/orders/order.route.js";

const router = express.Router();

router.get("/healthcheck", (req, res) => {
  res.status(200).json({ status: "OK" });
});

router.use("/api", authRouter);
router.use("/api", productRouter);
router.use("/api", orderRouter);

export default router;
