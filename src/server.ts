import express from "express";
import cors from "cors";
import morgan from "morgan";

import CONFIG from "./utils/config";

import info from "./routes/info";
import baidu from "./routes/baidu";
import baiduapi from "./routes/baiduapi";
import google from "./routes/google";
import caiyunapi from "./routes/caiyunapi";
import tencentapi from "./routes/tencentapi";
import xunfeiapi from "./routes/xunfeiapi";

import serviceDiscovery from "./routes/serviceDiscovery";

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
