/**
 * @description 路由-腾讯翻译API
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
import { TencentTranslatorAPI } from "../translator/translateEngines/tencentTranslatorApi";

const router = express.Router();

// 初始化腾讯翻译API
if (CONFIG["tencentapi"].enabled) {
  const tencentTranslatorAPI = new TencentTranslatorAPI(
    "腾讯翻译API",
    CONFIG["tencentapi"].translatorSetting
  );
  const tencentTranslatorAPICache = new PrismaCache("腾讯翻译API");
  const tencentTranslatorAPIFilter = new DefaultFilter(
    CONFIG["tencentapi"].filterSetting
  );
  const xunfeiAPIManager = new DefaultTranslatorManager(
    tencentTranslatorAPI,
    tencentTranslatorAPICache,
    tencentTranslatorAPIFilter
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
    res.status(400).json(msgBody("腾讯翻译API服务未启用"));
  });
}

export default router;
