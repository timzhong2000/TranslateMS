/**
 * @description 路由-info
 * @author Tim-Zhong-2000
 */

import express from "express";
import CONFIG from "../../config.json";
import { msgBody } from "../utils/msgBody";

const router = express.Router();

const entryList: { name: string; value: string }[] = [];
if (CONFIG.baidu.enabled) {
  entryList.push({ name: "百度翻译WEB", value: "baidu" });
}
if (CONFIG.baiduapi.enabled) {
  entryList.push({ name: "百度翻译API", value: "baiduapi" });
}
if (CONFIG.google.enabled) {
  entryList.push({ name: "谷歌翻译WEB", value: "google" });
}
if (CONFIG.caiyunapi.enabled) {
  entryList.push({ name: "彩云小译API", value: "caiyunapi" });
}
if (CONFIG.xunfeiapi.enabled) {
  entryList.push({ name: "讯飞翻译API", value: "xunfeiapi" });
}
if (CONFIG.tencentapi.enabled) {
  entryList.push({ name: "腾讯翻译API", value: "tencentapi" });
}
if (CONFIG.niutrans.enabled) {
  entryList.push({ name: "小牛翻译API", value: "niutransapi" });
}

router.get("/entrys", (_req, res) => {
  res.json(msgBody("获取翻译器列表成功", entryList));
});

export default router;
