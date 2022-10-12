/**
 * @description 百度翻译API，APPID与KEY需要在https://api.fanyi.baidu.com/ 申请
 * @author Tim-Zhong-2000
 */

import axios from "axios";
import md5 from "md5";
import { ITranslateEngine } from "../abstract/translateEngine";
import { TranslateLevel } from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import ISO639_1 from "../../types/ISO963";
import { getBaiduLangCode } from "../../utils/LangCode";

export interface BaiduTranslatorAPIConfig {
  APPID: string;
  KEY: string;
}

export class BaiduTranslatorAPI implements ITranslateEngine {
  private APPID: string;
  private KEY: string;
  private SALT = "1435660288";

  private get isConfigEmpty() {
    return this.APPID === "" && this.KEY === "";
  }

  constructor(private provider: string, config: BaiduTranslatorAPIConfig) {
    this.setConfig(config);
    console.log(`api configurattion apply: ${config.APPID}`);
  }

  /**
   * 请求翻译接口
   * @param src 源文本
   * @param srcLang 源语言
   * @param destLang 目标语言
   * @returns `Promise<Payload>` 翻译结果
   */
  async translate(
    src: string,
    srcLang: ISO639_1 = "ja",
    destLang: ISO639_1 = "zh_CN"
  ) {
    // 转换为百度接口的语言代码
    const baiduSrcLang = getBaiduLangCode(srcLang);
    const baiduDestLang = getBaiduLangCode(destLang);
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
        "此翻译服务器未设置API账户",
        srcLang,
        destLang,
        "none"
      );
    }
    const res = await axios.get(
      `https://fanyi-api.baidu.com/api/trans/vip/translate` +
        `?q=${src}&from=${baiduSrcLang}&to=${baiduDestLang}&appid=${
          this.APPID
        }&salt=${this.SALT}&sign=${this.sign(src)}`
    );
    if (!!res && !!res.data) {
      try {
        return generatePayload(
          true,
          TranslateLevel.AI,
          src,
          res.data.trans_result[0].dst as string,
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

  setConfig(config: BaiduTranslatorAPIConfig): void {
    ({ APPID: this.APPID, KEY: this.KEY } = config);
  }

  private sign(text: string) {
    const raw = `${this.APPID}${text}${this.SALT}${this.KEY}`;
    return md5(raw);
  }
}
