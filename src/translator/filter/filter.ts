/**
 * @description 文本过滤器，配置文件见config.json
 * @author Tim-Zhong-2000
 */

import { FilterConfig, FilterResult, FilterType } from "../../types/Translator";

export class DefaultFilter {
  config: FilterConfig;

  constructor(config: FilterConfig) {
    this.config = config;
  }

  /**
   * 文本过滤
   * @param text 过滤文本
   * @param lang 过滤语言
   * @returns
   */
  exec(text: string, lang: string): FilterResult {
    let pass = true;

    if (this.config.removeSpaceLangs.indexOf(lang) >= 0) {
      text = text.replace(/\ /g, "");
    }

    // 1. prefix filter
    if (!this.config.banPrefixs.every((prefix) => !text.startsWith(prefix))) {
      // text start with some prefix
      return {
        type: FilterType.PROXY,
        text: "",
      } as FilterResult;
    }

    // 2. words filter
    if (!this.config.banWords.every((word) => !text.includes(word))) {
      // text include some banWrods
      return {
        type: FilterType.BLOCK,
        text: "词汇违规",
      } as FilterResult;
    }

    // 3. reg filter
    if (!this.config.regs.every((regStr) => !RegExp(regStr).test(text))) {
      // text match some blacklist regs
      return {
        type: FilterType.BLOCK,
        text: "词汇违规",
      } as FilterResult;
    }

    return {
      type: FilterType.PASS,
      text: text,
    } as FilterResult;
  }
}
