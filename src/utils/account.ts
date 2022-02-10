import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import CONFIG from "../../config.json";
import { msgBody } from "./msgBody";

const db = new PrismaClient();

export class Account {
  constructor(private key: string) {}

  async getBalance() {
    return (
      await db.account.findUnique({
        where: {
          key: this.key,
        },
      })
    ).balance;
  }

  async consume(count: number) {
    return await db.account.update({
      where: {
        key: this.key,
      },
      data: {
        balance: { decrement: count },
      },
    });
  }

  async charge(count: number) {
    return await db.account.upsert({
      where: {
        key: this.key,
      },
      create: {
        key: this.key,
        balance: count,
      },
      update: {
        balance: { increment: count },
      },
    });
  }

  async destroy() {
    return await db.account.delete({
      where: {
        key: this.key,
      },
    });
  }
}

// 确定当前额度可以完成此次翻译
export const checkBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = req.query.key;
  if (!CONFIG.serverConfig.requireKey) {
    next();
  } else if (key) {
    const balance = await new Account(key as string).getBalance();
    if (balance < req.params.src.length || 0) {
      res.status(450).json(msgBody("当前key额度不足"));
    } else {
      next();
    }
  } else {
    res.status(403).json(msgBody("缺少密钥，当前服务器需要密钥"));
  }
};
