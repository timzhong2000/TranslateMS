import { Payload } from "../../types/Translator";
import { CacheEngine } from "../abstract/cacheEngine";
import { generatePayload } from "../../utils/generatePayload";

export class MapCache extends CacheEngine {
  db = new Map<string, Payload>();

  constructor(private provider: string) {
    super();
  }

  async get(
    src: string,
    srcLang: string,
    destLang: string
  ): Promise<Payload> {
    const cache = this.db.get(
      CacheEngine.generateHashKey(src, srcLang, destLang)
    );
    if (!cache) throw new Error("MISS");
    return generatePayload(
      true,
      cache.level,
      cache.src,
      cache.dest,
      cache.srcLang,
      cache.destLang,
      this.provider
    );
  }

  set(payload: Payload): void {
    const hashKey = CacheEngine.generateHashKey(
      payload.src,
      payload.srcLang,
      payload.destLang
    );
    this.db.set(hashKey, payload);
  }
}
