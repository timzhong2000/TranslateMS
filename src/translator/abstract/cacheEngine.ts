/**
 * @description 缓存抽象类
 * @author Tim-Zhong-2000
 */

import md5 from "md5";
import { CacheIdentity, Payload } from "../../types/Translator";
export abstract class CacheEngine {
  serivceProviderName = "unknown"; // 服务提供商名称

  abstract get(
    src: string,
    srcLang: string,
    destLang: string
  ): Promise<Payload>;

  abstract set(dest: Payload): void;

  static hash(str: string): string {
    return md5(str);
  }

  static generateHashKey(src: string, srcLang: string, destLang: string) {
    const origin: CacheIdentity = {
      src: src,
      srcLang: srcLang,
      destLang: destLang,
    };
    return this.hash(JSON.stringify(origin));
  }
}
