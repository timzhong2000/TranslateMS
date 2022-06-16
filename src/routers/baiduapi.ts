/**
 * @description 路由-百度翻译API
 * @author Tim-Zhong-2000
 */

import express from "express";
require("express-async-errors");
import CONFIG from "../../config.json";

import { BaiduTranslatorAPI } from "../translator/translateEngines/baiduTranslatorApi";
import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { LangList } from "../translator/langlist";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { Account, checkBalance } from "../utils/account";

const router = express.Router();

// 初始化百度翻译API
if (CONFIG["baiduapi"].enabled) {
  const baiduTranslatorAPI = new BaiduTranslatorAPI(
    "百度翻译API",
    CONFIG["baiduapi"].translatorSetting
  );
  const baiduTranslatorAPICache = new PrismaCache("百度翻译API");
  const baiduTranslatorAPIFilter = new DefaultFilter(
    CONFIG["baiduapi"].filterSetting
  );
  const baiduAPIManager = new DefaultTranslatorManager(
    baiduTranslatorAPI,
    baiduTranslatorAPICache,
    baiduTranslatorAPIFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", LangList));
  });

  router.get("/:srcLang/:destLang/:src", checkBalance, async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const payload = await baiduAPIManager.translate(
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
    res.status(400).json(msgBody("百度翻译API服务未启用"));
  });
}

export default router;
