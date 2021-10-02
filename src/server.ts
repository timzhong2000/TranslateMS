import express from "express";
import cors from "cors";
import morgan from "morgan";

import CONFIG from "./utils/config";

import info from "./routers/info";
import baidu from "./routers/baidu";
import baiduapi from "./routers/baiduapi";
import google from "./routers/google";
import caiyunapi from "./routers/caiyunapi";
import tencentapi from "./routers/tencentapi";
import xunfeiapi from "./routers/xunfeiapi";

import serviceDiscovery from "./routers/serviceDiscovery";

import checkConfig from "./utils/checkConfig";

checkConfig();
// express初始化
const app = express();

// 中间件
// allow cors
app.use(cors({ origin: CONFIG.serverConfig.frontend, credentials: true }));

// logger
app.use(morgan("combined"));

// post body
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

// 路由
app.use("/api/info", info);
app.use("/api/baidu", baidu);
app.use("/api/baiduapi", baiduapi);
app.use("/api/google", google);
app.use("/api/caiyunapi", caiyunapi);
app.use("/api/tencentapi", tencentapi);
app.use("/api/xunfeiapi", xunfeiapi);

app.use("/api/servicediscovery", serviceDiscovery);

// express启动配置
const PORT = CONFIG.serverConfig.port;
app.listen(PORT, () => {
  console.log(`启动成功，端口号:${PORT}`);
});
