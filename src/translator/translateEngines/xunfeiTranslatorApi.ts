/**
 * @description 讯飞翻译API，APPID与KEY需要在https://api.fanyi.baidu.com/ 申请
 * @author Tim-Zhong-2000
 */

import axios from "axios";
import CryptoJS from "crypto-js";
import { TranslateEngine } from "../abstract/translateEngine";
import {
  Payload,
  TranslateLevel,
  XunfeiTranslatorAPIConfig,
} from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import ISO639_1 from "../../types/ISO963";
import { getXunfeiLangCode } from "../../utils/LangCode";

export class XunfeiTranslatorAPI extends TranslateEngine {
  api_key = "";
  apiSecret = "";
  app_id = "";

  constructor(
    private provider = "讯飞翻译API",
    config: XunfeiTranslatorAPIConfig
  ) {
    super();
    this.setConfig(config);
  }
  async translate(
    src: string,
    srcLang: ISO639_1 = "ja",
    destLang: ISO639_1 = "zh_CN"
  ): Promise<Payload> {
    const xunfeiSrcLang = getXunfeiLangCode(srcLang);
    const xunfeiDestLang = getXunfeiLangCode(destLang);
    const date = new Date().toUTCString();
    const postBody = this.getPostBody(src, xunfeiSrcLang, xunfeiDestLang);
    const digest = this.getDigest(postBody);
    const res = await axios.post("https://itrans.xfyun.cn/v2/its", postBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json,version=1.0",
        Host: "itrans.xfyun.cn",
        Date: date,
        Digest: digest,
        Authorization: this.getAuthStr(date, digest),
      },
    });
    const body = res.data;
    if (body.code !== 0) {
      return generatePayload(
        false,
        TranslateLevel.AI,
        src,
        body.message || "未知错误",
        srcLang,
        destLang,
        this.provider
      );
    } else {
      return generatePayload(
        true,
        TranslateLevel.AI,
        src,
        body.data.result.trans_result.dst,
        srcLang,
        destLang,
        this.provider
      );
    }
  }
  setConfig(config: XunfeiTranslatorAPIConfig): void {
    this.api_key = config.api_key;
    this.apiSecret = config.apiSecret;
    this.app_id = config.app_id;
  }

  // 生成请求body
  getPostBody(text: string, from: string, to: string) {
    const digestObj = {
      //填充common
      common: {
        app_id: this.app_id,
      },
      //填充business
      business: {
        from: from,
        to: to,
      },
      //填充data
      data: {
        text: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text)),
      },
    };
    return digestObj;
  }

  // 请求获取请求体签名
  getDigest(body: any) {
    return (
      "SHA-256=" +
      CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(JSON.stringify(body)))
    );
  }

  // 鉴权签名
  getAuthStr(date: string, digest: string) {
    const signatureOrigin = `host: https://itrans.xfyun.cn/v2/its\ndate: ${date}\nPOST /v2/its HTTP/1.1\ndigest: ${digest}`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${this.api_key}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`;
    return authorizationOrigin;
  }
}
