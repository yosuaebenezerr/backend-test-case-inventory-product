import { NextFunction, Request, Response } from "express";
import {
  AddUserTypeSchema,
  LoginSchema,
  UpdatePasswordSchema,
} from "./auth.schema.js";
import authService from "./auth.service.js";
import { authRepository } from "./auth.repository.js";

export const authController = {
  handleLogin: async (
    req: Request<LoginSchema["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const { username, password } = req.body;
    const response = await authService.signIn({
      payload: { username, password },
    });

    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000 * 6,
    });

    res.status(200).json({
      status: "success",
      statusCode: res.statusCode,
      message: "Login berhasil",
      data: response,
    });
  },

  handleLogOut: async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: "error",
        statusCode: res.statusCode,
        message: "Token tidak ditemukan",
      });
    }

    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Logout berhasil",
      });
    } catch (error) {
      next(error);
    }
  },

  handleRegister: async (req: Request, res: Response, next: NextFunction) => {
    const response = await authService.signUp({ payload: req.body });

    return res.status(201).json({
      status: "success",
      statusCode: res.statusCode,
      message: "Register berhasil",
      data: response,
    });
  },

  handleChangePassword: async (
    req: Request<{}, {}, UpdatePasswordSchema["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id!;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      await authService.updatePasswordUser({
        userId,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      return res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        message: "Password berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  },
};
