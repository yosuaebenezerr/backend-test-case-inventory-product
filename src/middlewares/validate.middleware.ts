import type { NextFunction, Request, Response } from "express";

import createHttpError from "http-errors";
import { ZodTypeAny } from "zod";

const validateResource =
  <T extends ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      throw createHttpError(
        400,
        "Validasi gagal: " + JSON.stringify(parsed.error.flatten().fieldErrors),
      );
    }

    next();
  };

export default validateResource;
