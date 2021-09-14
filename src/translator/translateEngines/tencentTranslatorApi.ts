/**
 * @description 腾讯翻译API，APPID与KEY需要在https://cloud.tencent.com/product/tmt 申请
 * @author Tim-Zhong-2000
 */
import { tmt } from "tencentcloud-sdk-nodejs";

import { TranslateEngine } from "../abstract/translateEngine";
import {
  Payload,
  TencentTranslatorAPIConfig,
  TranslateLevel,
} from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import ISO639_1 from "../../types/ISO963";
import { getTencentLangCode } from "../../utils/LangCode";
import { Client } from "tencentcloud-sdk-nodejs/tencentcloud/services/tmt/v20180321/tmt_client";
import { TextTranslateRequest } from "tencentcloud-sdk-nodejs/tencentcloud/services/tmt/v20180321/tmt_models";

export class TencentTranslatorAPI extends TranslateEngine {
  projectId: number;
  secretId: string;
  secretKey: string;
  client: Client;
  constructor(private provider: string, config: TencentTranslatorAPIConfig) {
    super();
    this.setConfig(config);
  }
  async translate(
    src: string,
    srcLang: ISO639_1 = "ja",
    destLang: ISO639_1 = "zh_CN"
  ): Promise<Payload> {
    const tencentSrcLang = getTencentLangCode(srcLang);
    const tencentDestLang = getTencentLangCode(destLang);
    const request: TextTranslateRequest = {
      SourceText: src,
      Source: tencentSrcLang,
      Target: tencentDestLang,
      ProjectId: this.projectId,
    };
    try {
      const res = await this.client.TextTranslate(request);
      return generatePayload(
        true,
        TranslateLevel.AI,
        src,
        res.TargetText,
        srcLang,
        destLang,
        this.provider
      );
    } catch (err) {
      return generatePayload(
        false,
        TranslateLevel.AI,
        src,
        "",
        srcLang,
        destLang,
        this.provider
      );
    }
  }
  setConfig(config: TencentTranslatorAPIConfig): void {
    this.projectId = Number(config.ProjectId);
    const clientConfig = {
      // 腾讯云认证信息
      credential: {
        secretId: config.SecretKey,
        secretKey: config.SecretKey,
      },
      // 产品地域
      region: "ap-shanghai",
      // 可选配置实例
      profile: {
        signMethod: "HmacSHA256" as
          | "HmacSHA256"
          | "TC3-HMAC-SHA256"
          | "HmacSHA1", // 签名方法
        httpProfile: {
          reqMethod: "POST" as "POST" | "GET", // 请求方法
          reqTimeout: 10, // 请求超时时间，默认60s
        },
      },
    };
    this.client = new tmt.v20180321.Client(clientConfig);
  }
}
