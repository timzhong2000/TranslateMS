/**
 * @description 路由-彩云小译API
 * @author Tim-Zhong-2000
 */

import express from "express";
import CONFIG from "../utils/config";

import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { caiyunLangList, LangList } from "../translator/langlist";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { CaiyunTranslatorAPI } from "../translator/translateEngines/caiyunTranslatorApi";

const router = express.Router();

// 初始化彩云小译API
if (CONFIG["caiyunapi"].enabled) {
  const caiyunTranslatorAPI = new CaiyunTranslatorAPI(
    "彩云小译API",
    CONFIG["caiyunapi"].translatorSetting
  );
  const caiyunTranslatorAPICache = new PrismaCache("彩云小译API");
  const caiyunTranslatorAPIFilter = new DefaultFilter(
    CONFIG["caiyunapi"].filterSetting
  );
  const caiyunAPIManager = new DefaultTranslatorManager(
    caiyunTranslatorAPI,
    caiyunTranslatorAPICache,
    caiyunTranslatorAPIFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", caiyunLangList));
  });

  router.get("/:srcLang/:destLang/:src", async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const dest = await caiyunAPIManager.translate(src, decodeURIComponent(srcLang), destLang);
    res.json(msgBody(`获取翻译${dest.success ? "成功" : "失败"}`, dest));
  });
} else {
  router.use((_req, res) => {
    res.status(400).json(msgBody("彩云小译API服务未启用"));
  });
}

export default router;
