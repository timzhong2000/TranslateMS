/**
 * @description 小牛API，APIKEY需要在 https://niutrans.com/cloud/overview 申请
 * @author Tim-Zhong-2000
 */

import axios from "axios";
import { ITranslateEngine } from "../abstract/translateEngine";
import {
  NiutransAPIConfig,
  NiutransPayload,
  TranslateLevel,
} from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import ISO639_1 from "../../types/ISO963";
import { getNiutransLangCode } from "../../utils/LangCode";

export class NiutransTranslatorAPI implements ITranslateEngine {
  private APIKEY: string = "";

  private get isConfigEmpty() {
    return this.APIKEY === "";
  }

  constructor(private provider: string, config: NiutransAPIConfig) {
    this.setConfig(config);
    console.log(`api configurattion apply: ${config.APIKEY}`);
  }

  async translate(
    src: string,
    srcLang: ISO639_1 = "ja",
    destLang: ISO639_1 = "zh_CN"
  ) {
    // 转换为小牛接口的语言代码
    const niutrnasSrcLang = getNiutransLangCode(srcLang);
    const niutrnasDestLang = getNiutransLangCode(destLang);
    if (srcLang === destLang) {
      return generatePayload(
        true,
        TranslateLevel.VERIFIED,
        src,
        src,
        srcLang,
        destLang,
        "none"
      );
    }
    if (this.isConfigEmpty) {
      return generatePayload(
        false,
        TranslateLevel.VERIFIED,
        src,
        "此翻译服务未设置APIKEY",
        srcLang,
        destLang,
        "none"
      );
    }
    const res = await axios.post(
      "https://api.niutrans.com/NiuTransServer/translation",
      {
        from: niutrnasSrcLang,
        to: niutrnasDestLang,
        apikey: this.APIKEY,
        src_text: src,
      } as NiutransPayload
    );
    if (!!res && !!res.data) {
      try {
        return generatePayload(
          true,
          TranslateLevel.AI,
          src,
          res.data.tgt_text as string,
          srcLang,
          destLang,
          this.provider
        );
      } catch (error) {
        return generatePayload(
          false,
          TranslateLevel.AI,
          src,
          `错误码：${res.data.error_code}`,
          srcLang,
          destLang,
          this.provider
        );
      }
    }
  }

  setConfig(config: NiutransAPIConfig): void {
    this.APIKEY = config.APIKEY;
  }
}
