import { Request, Response, NextFunction } from "express"
import CONFIG from "./config";
import { msgBody } from "./msgBody";

export const verifyKey = (req: Request, res: Response, next: NextFunction) => {
  if (!CONFIG.serverConfig.key || (CONFIG.serverConfig.key && req.query.key === CONFIG.serverConfig.key)) {
    next();
  } else {
    res.status(403).json(msgBody("你没有权限访问这个服务器"));
  }
}