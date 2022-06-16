import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import { NextFunction, Response, Request } from "express";

class MyError extends Error {
  innerError;
  constructor(message?: string, innerError?: any) {
    super(message);
    this.innerError = innerError;
  }
}
export class ConfigError extends MyError {} // 参数验证抛出错误
export class NotFoundError extends MyError {} // 资源不存在错误
export class DBError extends MyError {} // 数据库访问的错误
export class LockError extends MyError {} // 部分资源因为依赖关系无法操作抛出的错误
export class PermissionError extends MyError {} // 权限错误

export const errorProcessor = (err: any) => {
  if (err instanceof NotFoundError)
    return { code: 404, kind: "找不到资源", message: err.message };
  if (err instanceof ConfigError)
    return { code: 400, kind: "参数错误", message: err.message };
  if (err instanceof LockError)
    return { code: 400, kind: "状态错误", message: err.message };
  if (err instanceof DBError) {
    console.log(err);
    return { code: 500, kind: "数据库错误", message: "" };
  }
  if (
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientValidationError
  )
    return { code: 500, kind: "数据库错误", message: err.message };
  // 未知错误
  console.log("未知错误", err);
  return { code: 500, kind: "未知错误", message: "" };
};

export const expressGlobalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const e = errorProcessor(err);
  res.status(e.code).json(e);
};
