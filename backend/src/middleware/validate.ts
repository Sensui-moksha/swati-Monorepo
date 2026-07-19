import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError, ZodEffects } from "zod";
import { ApiError } from "./errorHandler";

export const validate =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return next(new ApiError("Validation failed", 400, errors));
      }
      next(error);
    }
  };

export const validateBody = (schema: AnyZodObject) =>
  validate(schema.pick({ body: true }));

export const validateQuery = (schema: AnyZodObject) =>
  validate(schema.pick({ query: true }));

export const validateParams = (schema: AnyZodObject) =>
  validate(schema.pick({ params: true }));
