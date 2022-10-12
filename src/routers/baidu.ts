/**
 * @description 路由-百度翻译
 * @author Tim-Zhong-2000
 */

import express from "express";
require("express-async-errors");
import CONFIG from "../../config.json";

import { BaiduTranslatorCrawler } from "../translator/translateEngines/baiduTranslatorCrawler";
import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { LangList } from "../translator/languageAdapter";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { Account, checkBalance } from "../utils/account";

const router = express.Router();

// 初始化百度翻译
if (CONFIG["baidu"].enabled) {
  const baiduTranslatorCrawler = new BaiduTranslatorCrawler("百度翻译WEB");
  const baiduTranslatorCrawlerCache = new PrismaCache("百度翻译WEB");
  const baiduTranslatorFilter = new DefaultFilter(
    CONFIG["baidu"].filterSetting
  );
  const baiduCrawlerManager = new DefaultTranslatorManager(
    baiduTranslatorCrawler,
    baiduTranslatorCrawlerCache,
    baiduTranslatorFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", LangList));
  });

  router.get("/reload", async (_req, res) => {
    await baiduTranslatorCrawler.autoConfig();
    res.status(201).send("Finished");
  });

  router.get("/:srcLang/:destLang/:src", checkBalance, async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const payload = await baiduCrawlerManager.translate(
      src,
      decodeURIComponent(srcLang),
      destLang
    );
    if (CONFIG.serverConfig.requireKey && payload.success) {
      await new Account(req.query.key as string).consume(payload.src.length);
    }
    res.json(msgBody(`获取翻译${payload.success ? "成功" : "失败"}`, payload));
  });
} else {
  router.use((_req, res) => {
    res.status(400).json(msgBody("百度翻译服务未启用"));
  });
}

export default router;
