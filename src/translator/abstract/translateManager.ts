/**
 * @description 翻译总模块抽象类
 * @author Tim-Zhong-2000
 */

import { DefaultFilter } from "../filter/filter";
import { Payload } from "../../types/Translator";
import { CacheEngine } from "./cacheEngine";
import { ITranslateEngine } from "./translateEngine";

export abstract class TranslateManager {
  constructor(
    protected translateEngine: ITranslateEngine,
    protected cacheEngine: CacheEngine,
    protected filter: DefaultFilter
  ) {}

  /**
   * 翻译函数，进行过滤与缓存
   * @param src 源文本
   * @param srcLang 源语言
   * @param destLang 目标语言
   * @returns `Promise<Payload>` 翻译结果
   */
  abstract translate(
    src: string,
    srcLang: string,
    destLang: string
  ): Promise<Payload>;

  abstract writeCache(dest: Payload): void;
  abstract readCache(src: string, srcLang: string, destLang: string): void;
}
