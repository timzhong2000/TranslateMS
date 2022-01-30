/**
 * @description 路由-百度翻译API
 * @author Tim-Zhong-2000
 */

import express from "express";
import CONFIG from "../utils/config";

import { BaiduTranslatorAPI } from "../translator/translateEngines/baiduTranslatorApi";
import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { LangList } from "../translator/langlist";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";

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

  router.get("/:srcLang/:destLang/:src", async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const dest = await baiduAPIManager.translate(src, decodeURIComponent(srcLang), destLang);
    res.json(msgBody(`获取翻译${dest.success ? "成功" : "失败"}`, dest));
  });
} else {
  router.use((_req, res) => {
    res.status(400).json(msgBody("百度翻译API服务未启用"));
  });
}

export default router;
