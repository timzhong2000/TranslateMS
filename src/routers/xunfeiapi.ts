/**
 * @description 路由-讯飞翻译API
 * @author Tim-Zhong-2000
 */

import express from "express";
import CONFIG from "../utils/config";

import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { LangList } from "../translator/langlist";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { XunfeiTranslatorAPI } from "../translator/translateEngines/xunfeiTranslatorApi";

const router = express.Router();

// 初始化讯飞翻译API
if (CONFIG["xunfeiapi"].enabled) {
  const xunfeiTranslatorAPI = new XunfeiTranslatorAPI(
    "讯飞翻译API",
    CONFIG["xunfeiapi"].translatorSetting
  );
  const xunfeiTranslatorAPICache = new PrismaCache("讯飞翻译API");
  const xunfeiTranslatorAPIFilter = new DefaultFilter(
    CONFIG["xunfeiapi"].filterSetting
  );
  const xunfeiAPIManager = new DefaultTranslatorManager(
    xunfeiTranslatorAPI,
    xunfeiTranslatorAPICache,
    xunfeiTranslatorAPIFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", LangList));
  });

  router.get("/:srcLang/:destLang/:src", async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const payload = await xunfeiAPIManager.translate(src, srcLang, destLang);
    res.json(msgBody("获取翻译成功", payload));
  });
} else {
  router.use((_req, res) => {
    res.status(400).json(msgBody("讯飞翻译API服务未启用"));
  });
}

export default router;
