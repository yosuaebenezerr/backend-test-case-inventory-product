import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET_KEY!;
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
