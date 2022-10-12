/**
 * @description 适配百度翻译web翻译接口
 * @author Tim-Zhong-2000
 */

import axios from "axios";
import qs from "qs";
import { ITranslateEngine } from "../abstract/translateEngine";
import {
  BaiduTranslatorConfig,
  BaiduPayload,
  TranslateLevel,
} from "../../types/Translator";
import { generatePayload } from "../../utils/generatePayload";
import { getBaiduLangCode } from "../../utils/LangCode";
import ISO639_1 from "../../types/ISO963";

export class BaiduTranslatorCrawler implements ITranslateEngine {
  configReady = false;
  gtk: string = null;
  cookie: string = null;
  UA: string = null;
  token: string = null;

  /**
   * @param config 百度翻译配置
   */
  constructor(private provider: string, config?: BaiduTranslatorConfig) {
    if (!!config) {
      this.configReady = true;
      this.setConfig(config);
    } else {
      this.UA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.64";
      this.autoConfig();
    }
  }

  setConfig(config: BaiduTranslatorConfig) {
    ({
      gtk: this.gtk,
      cookie: this.cookie,
      UA: this.UA,
      token: this.token,
    } = config);
  }

  /**
   * 自动设置token，gtk，cookie，UA
   */
  async autoConfig(retry = 0) {
    if (retry && retry > 10) {
      console.log("自动配置失败，请检查网络");
      return;
    }
    console.log("开始自动配置");

    // 第一次请求获取cookie
    console.log("开始第一次请求");
    try {
      const res = await axios.get("https://fanyi.baidu.com/");
      this.cookie = this.getCookie(res);
      console.log(`成功设置cookie: ${this.cookie}`);
    } catch (err) {
      console.error("第一次请求失败,尝试重启自动配置");
      this.autoConfig(retry + 1);
      return;
    }

    // 第二次请求获取gtk和token
    console.log("开始第二次请求");
    try {
      const res = await axios.get("https://fanyi.baidu.com/", {
        headers: this.getHeader(),
      });
      this.gtk = this.getGtk(res["data"]);
      console.log(`成功设置gtk: ${this.gtk}`);
      this.token = this.getToken(res["data"]);
      console.log(`成功设置token: ${this.token}`);
    } catch (err) {
      console.error("第二次请求发生错误,尝试重启自动配置");
      this.autoConfig(retry + 1);
      return;
    }

    console.log(`自动配置完成`);
    this.configReady = true;

    // 启用配置自动刷新
    setTimeout(() => {
      console.log("Update config using autoConfig");
      this.autoConfig(retry + 1);
    }, 3 * 60 * 60 * 1000);
  }

  getCookie(res: any) {
    return res["headers"]["set-cookie"][0];
  }

  getGtk(html: string) {
    return /[0-9]{6}\.[0-9]{9}/i.exec(html)[0];
  }

  getToken(html: string) {
    return /token\: '(.*?)'/.exec(html)[1];
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
        this.provider
      );
    }

    if (!this.configReady)
      throw new Error("Please WAIT: auto config is not finished");

    const res = await axios.post(
      `https://fanyi.baidu.com/v2transapi?from=${baiduSrcLang}&to=${baiduDestLang}`,
      this.getBody(src, baiduSrcLang, baiduDestLang),
      { headers: this.getHeader() }
    );
    try {
      return generatePayload(
        true,
        TranslateLevel.AI,
        src,
        res.data["trans_result"]["data"][0]["dst"] as string,
        srcLang,
        destLang,
        this.provider
      );
    } catch (error) {
      return generatePayload(
        false,
        TranslateLevel.AI,
        src,
        `${res.data.errmsg}: ${res.data.errno}`,
        srcLang,
        destLang,
        this.provider
      );
    }
  }

  /**
   * 构建urlencoded格式请求体
   * @param src 待翻译文本
   * @param srcLang 源语言
   * @param destLang 目标语言
   * @returns
   */
  private getBody(
    src: string,
    srcLang: string = "jp",
    destLang: string = "zh"
  ): string {
    return qs.stringify({
      from: srcLang,
      to: destLang,
      query: src,
      transtype: "realtime",
      simple_means_flag: 3,
      sign: this.getSign(src),
      token: this.token,
      domain: "common",
    } as BaiduPayload);
  }

  /**
   * 给请求签名，签名函数来自百度翻译网站
   * @param src 待翻译文本
   * @returns sign
   */
  private getSign(src: string): string {
    const a = (r: unknown) => {
      if (Array.isArray(r)) {
        for (var o = 0, t = Array(r.length); o < r.length; o++) t[o] = r[o];
        return t;
      }
      return Array(r);
    };
    const n = (r: any, o: any) => {
      for (var t = 0; t < o.length - 2; t += 3) {
        var a = o.charAt(t + 2);
        (a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a)),
          (a = "+" === o.charAt(t + 1) ? r >>> a : r << a),
          (r = "+" === o.charAt(t) ? (r + a) & 4294967295 : r ^ a);
      }
      return r;
    };
    const o = src.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
    if (null === o) {
      var t = src.length;
      t > 30 &&
        (src =
          "" +
          src.substr(0, 10) +
          src.substr(Math.floor(t / 2) - 5, 10) +
          src.substr(-10, 10));
    } else {
      for (
        var e = src.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/),
          C = 0,
          h = e.length,
          f: string[] = [];
        h > C;
        C++
      )
        "" !== e[C] && f.push.apply(f, a(e[C].split(""))),
          C !== h - 1 && f.push(o[C]);
      const g = f.length;
      g > 30 &&
        (src =
          f.slice(0, 10).join("") +
          f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") +
          f.slice(-10).join(""));
    }

    const u = this.gtk;
    for (
      var d = u.split("."),
        m = Number(d[0]) || 0,
        s = Number(d[1]) || 0,
        S = [],
        c = 0,
        v = 0;
      v < src.length;
      v++
    ) {
      var A = src.charCodeAt(v);
      128 > A
        ? (S[c++] = A)
        : (2048 > A
            ? (S[c++] = (A >> 6) | 192)
            : (55296 === (64512 & A) &&
              v + 1 < src.length &&
              56320 === (64512 & src.charCodeAt(v + 1))
                ? ((A =
                    65536 + ((1023 & A) << 10) + (1023 & src.charCodeAt(++v))),
                  (S[c++] = (A >> 18) | 240),
                  (S[c++] = ((A >> 12) & 63) | 128))
                : (S[c++] = (A >> 12) | 224),
              (S[c++] = ((A >> 6) & 63) | 128)),
          (S[c++] = (63 & A) | 128));
    }
    for (var p = m, F = "+-a^+6", D = "+-3^+b+-f", b = 0; b < S.length; b++)
      (p += S[b]), (p = n(p, F));
    return (
      (p = n(p, D)),
      (p ^= s),
      0 > p && (p = (2147483647 & p) + 2147483648),
      (p %= 1e6),
      p.toString() + "." + (p ^ m)
    );
  }

  /**
   * 构建header
   * @returns 构建的header
   */
  private getHeader() {
    return {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": this.UA,
      Host: "fanyi.baidu.com",
      Origin: "https://fanyi.baidu.com",
      Referer: "https://fanyi.baidu.com/",
      cookie: this.cookie,
      "sec-ch-ua":
        "'Chromium';v='88', 'Google Chrome';v='88', ';Not A Brand';v='99'",
    };
  }
}
