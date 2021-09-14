import CONFIG from "./config";
function checkServerConfig(part: any) {
  if (!part.listen) {
    console.warn("serviceConfig.listen 未配置，使用默认值0.0.0.0");
    part.listen = "0.0.0.0";
  }
  if (!part.port || !Number.isInteger(part.port)) {
    throw new Error("端口号必须为整数");
  }
  if (!part.frontend) {
    console.warn(
      "serviceConfig.frontend 未配置，使用默认值*，可能会导致浏览器触发跨域限制"
    );
    part.frontend = "*";
  }
}

function checkTranslators(CONFIG: any) {
  Object.keys(CONFIG)
    .filter((key) => key !== "serverConfig")
    .forEach((key) => {
      if (!CONFIG[key].translatorSetting) {
        throw new Error(`${key}.translatorSetting 缺失`);
      }
      if (!CONFIG[key].cacheSetting) {
        throw new Error(`${key}.cacheSetting 缺失`);
      }
      if (!CONFIG[key].filterSetting) {
        throw new Error(`${key}.filterSetting 缺失`);
      }
    });
}

export default function checkConfig() {
  if (!CONFIG["serverConfig"]) throw new Error("serverConfig缺失");
  checkServerConfig(CONFIG["serverConfig"]);
  checkTranslators(CONFIG);
  console.log("成功通过配置文件检查");
}
