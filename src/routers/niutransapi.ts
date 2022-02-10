/**
 * @description 路由-小牛翻译API
 * @author Tim-Zhong-2000
 */

import express from "express";
import CONFIG from "../../config.json";

import { DefaultTranslatorManager } from "../translator/translateManager/DefaultTranslatorManager";
import { DefaultFilter } from "../translator/filter/filter";
import { LangList } from "../translator/langlist";
import { msgBody } from "../utils/msgBody";
import { PrismaCache } from "../translator/cacheEngines/prismaCache";
import { NiutransTranslatorAPI } from "../translator/translateEngines/niuTranslatorApi";
import { Account, checkBalance } from "../utils/account";

const router = express.Router();

// 初始化小牛API
if (CONFIG["niutrans"].enabled) {
  const niutransAPI = new NiutransTranslatorAPI(
    "小牛翻译API",
    CONFIG["niutrans"].translatorSetting
  );
  const niutransAPICache = new PrismaCache("小牛翻译API");
  const niutrnasAPIFilter = new DefaultFilter(CONFIG["niutrans"].filterSetting);
  const niutransManager = new DefaultTranslatorManager(
    niutransAPI,
    niutransAPICache,
    niutrnasAPIFilter
  );

  router.get("/langlist", (_req, res) => {
    res.json(msgBody("获取语言列表成功", LangList));
  });

  router.get("/:srcLang/:destLang/:src", checkBalance, async (req, res) => {
    const { src, srcLang, destLang } = req.params;
    const payload = await niutransManager.translate(
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
    res.status(400).json(msgBody("小牛翻译API服务未启用"));
  });
}

export default router;
