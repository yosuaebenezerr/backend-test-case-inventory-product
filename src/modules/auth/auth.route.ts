import { Router } from "express";
import { authController } from "./auth.controller.js";
import validateResource from "../../middlewares/validate.middleware.js";
import {
  addUserTypeSchema,
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from "./auth.schema.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/sign-in",
  validateResource(loginSchema),
  authController.handleLogin,
);

router.post("/sign-out", authMiddleware, authController.handleLogOut);

router.post(
  "/register",
  validateResource(registerSchema),
  authController.handleRegister,
);

router.put(
  "/change-password",
  authMiddleware,
  validateResource(updatePasswordSchema),
  authController.handleChangePassword,
);

export default router;
