/**
 * @description 翻译抽象类
 * @author Tim-Zhong-2000
 */

import { Payload } from "../../types/Translator";

export interface ITranslateEngine {
  /**
   * @param src 源文本
   * @param srcLang 源语言
   * @param destLang 目标语言
   * @returns {Promise<Payload>} 翻译结果
   */
  translate(src: string, srcLang: string, destLang: string): Promise<Payload>;
  setConfig(config: any): void;
}
