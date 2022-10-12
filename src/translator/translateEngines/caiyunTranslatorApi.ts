/**
 * @description 彩云小译API，token需要在https://dashboard.caiyunapp.com/user/sign_in/ 申请
 * @author Tim-Zhong-2000
 */

import axios from "axios";
import { ITranslateEngine } from "../abstract/translateEngine";
import {
  TranslateLevel,
  CaiyunTranslatorAPIConfig,
} from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import ISO639_1 from "../../types/ISO963";

export class CaiyunTranslatorAPI implements ITranslateEngine {
  private token = "";

  constructor(private provider: string, config: CaiyunTranslatorAPIConfig) {
    this.setConfig(config);
  }

  async translate(
    src: string,
    srcLang: ISO639_1 = "ja",
    destLang: ISO639_1 = "zh_CN"
  ) {
    if (srcLang === destLang) {
      return generatePayload(
        true,
        TranslateLevel.VERIFIED,
        src,
        src,
        srcLang,
        destLang,
        this.provider
      );
    }

    const payload = {
      source: [src],
      trans_type: this.getDirection(srcLang, destLang),
      request_id: "test",
    };
    const res = await axios.post(
      "https://api.interpreter.caiyunai.com/v1/translator",
      payload,
      {
        headers: {
          "content-type": "application/json",
          "x-authorization": "token " + this.token,
        },
      }
    );
    try {
      return generatePayload(
        true,
        TranslateLevel.AI,
        src,
        res.data["target"][0],
        srcLang,
        destLang,
        this.provider
      );
    } catch (err) {
      return generatePayload(
        false,
        TranslateLevel.AI,
        src,
        `${res.data.error}`,
        srcLang,
        destLang,
        this.provider
      );
    }
  }

  setConfig(config: CaiyunTranslatorAPIConfig): void {
    this.token = config.token;
  }

  /**
   * 获取翻译方向，彩云小译API截至目前只支持中英，中日互译
   * @param srcLang 源语言
   * @param destLang 目标语言
   */
  getDirection(srcLang: ISO639_1, destLang: ISO639_1) {
    switch (srcLang) {
      case "zh_CN":
        switch (destLang) {
          case "en":
            return "zh2en";
          case "ja":
            return "zh2ja";
          default:
            throw new Error("do not support given direction");
        }
      case "en":
        switch (destLang) {
          case "zh_CN":
            return "en2zh";
          default:
            throw new Error("do not support given direction");
        }
      case "ja":
        switch (destLang) {
          case "zh_CN":
            return "ja2zh";
          default:
            throw new Error("do not support given direction");
        }
      default:
        throw new Error("do not support given direction");
    }
  }
}
