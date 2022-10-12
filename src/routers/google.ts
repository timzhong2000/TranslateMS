/**
 * @description 路由-谷歌翻译
 * @author Tim-Zhong-2000
 */

import express from "express";
require("express-async-errors");
import CONFIG from "../../config.json";

import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { GoogleTranslatorCrawler } from "../translator/translateEngines/googleTranslatorCrawler";
import { LangList } from "../translator/languageAdapter";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { msgBody } from "../utils/msgBody";
import { Account, checkBalance } from "../utils/account";

const router = express.Router();

// 初始化谷歌翻译
if (CONFIG["google"].enabled) {
  const googleTranslatorCrawler = new GoogleTranslatorCrawler(
    "谷歌翻译WEB",
    CONFIG["google"].translatorSetting
  );
  const googleTranslatorCrawlerCache = new PrismaCache("谷歌翻译WEB");
  const googleTranslatorCrawlerFilter = new DefaultFilter(
    CONFIG["google"].filterSetting
  );
  const googleTranslateManager = new DefaultTranslatorManager(
    googleTranslatorCrawler,
    googleTranslatorCrawlerCache,
    googleTranslatorCrawlerFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", LangList));
  });

  router.get("/:srcLang/:destLang/:src", checkBalance, async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const payload = await googleTranslateManager.translate(
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
    res.status(400).json(msgBody("谷歌翻译服务未启用"));
  });
}

export default router;
