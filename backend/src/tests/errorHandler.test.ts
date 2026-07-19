import { ApiError, errorHandler, notFound } from "../middleware/errorHandler";

describe("errorHandler and notFound middleware", () => {
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test("notFound passes ApiError to next", () => {
    const req: any = { originalUrl: "/missing" };
    notFound(req, {} as any, next);
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("/missing");
  });

  test("errorHandler in development prints stack and error object", () => {
    jest.resetModules();
    jest.doMock("../config/index", () => ({
      env: { NODE_ENV: "development" },
    }));
    // re-require the handler to pick up mocked config
    const { errorHandler: devHandler } = require("../middleware/errorHandler");

    const err = new Error("boom") as any;
    err.statusCode = 500;
    err.stack = "stack";

    const resDev: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    devHandler(err, {} as any, resDev, jest.fn());

    expect(resDev.status).toHaveBeenCalledWith(500);
    expect(resDev.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "boom" }),
    );
  });

  test("errorHandler handles CastError and duplicate key in production", () => {
    jest.resetModules();
    jest.doMock("../config/index", () => ({ env: { NODE_ENV: "production" } }));
    const {
      errorHandler: prodHandler,
      ApiError: ProdApiError,
    } = require("../middleware/errorHandler");

    // CastError
    const castErr: any = new Error("cast");
    castErr.name = "CastError";
    castErr.path = "id";
    castErr.value = "bad";

    const resProd1: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prodHandler(castErr, {} as any, resProd1, jest.fn());
    expect(resProd1.status).toHaveBeenCalled();
    expect(resProd1.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.any(String) }),
    );

    // Duplicate key
    const dupErr: any = new Error("dup");
    dupErr.code = 11000;
    dupErr.keyValue = { email: "a@b.com" };
    const resProd2: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    prodHandler(dupErr, {} as any, resProd2, jest.fn());
    expect(resProd2.status).toHaveBeenCalled();
    expect(resProd2.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Duplicate field value"),
      }),
    );
  });
});
