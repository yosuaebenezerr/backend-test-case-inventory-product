import { NextFunction, Request, Response } from "express";
import { AppError } from "../error/app.error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ message: "Internal Server Error" });
};
