/**
 * @description 路由-账户系统
 * @author Tim-Zhong-2000
 */

import express, { Request, Response } from "express";
import CONFIG from "../../config.json";

import { msgBody } from "../utils/msgBody";
import { Account } from "../utils/account";

const router = express.Router();

if (CONFIG.serverConfig.requireKey) {
  router.get("/:key/balance", async (req: Request, res: Response) => {
    try {
      res.json(
        msgBody("获取余额成功", {
          balance: await new Account(req.params.key).getBalance(),
        })
      );
    } catch (err) {
      res.status(500).json(msgBody("获取余额失败"));
    }
  });
  router.post("/:key/charge", async (req: Request, res: Response) => {
    const count = Number(req.body.count);
    const adminKey = req.query.adminKey;
    if (adminKey !== CONFIG.serverConfig.accountManagerKey) {
      res.status(403).json(msgBody("管理密钥错误"));
      return;
    }
    try {
      const account = await new Account(req.params.key).charge(count);
      res.json(msgBody("充值成功", account));
    } catch (err) {
      res.status(500).json(msgBody("充值失败"));
    }
  });
} else {
  router.use((_req, res) => {
    res.status(400).json(msgBody("账户系统未启动，免费服务器不需要密钥"));
  });
}

export default router;
