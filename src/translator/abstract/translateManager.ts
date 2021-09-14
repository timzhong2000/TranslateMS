/**
 * @description 翻译总模块抽象类
 * @author Tim-Zhong-2000
 */

import { DefaultFilter } from "../filter/filter";
import { Payload } from "../../types/Translator";
import { CacheEngine } from "./cacheEngine";
import { TranslateEngine } from "./translateEngine";

export abstract class TranslateManager<CacheType> {
  constructor(
    protected translateEngine: TranslateEngine,
    protected cacheEngine: CacheEngine<CacheType>,
    protected filter: DefaultFilter
  ) {
    if (!translateEngine || !cacheEngine) {
      throw new Error("translateEngine or cacheEngine missing");
    }
  }

  abstract translate(
    src: string,
    srcLang: string,
    destLang: string
  ): Promise<Payload>;

  abstract writeCache(dest: Payload): void;

  abstract readCache(src: string, srcLang: string, destLang: string): void;
}
