import { PrismaClient, Translate } from "@prisma/client";
import { Payload } from "../../types/Translator";
import { USER } from "../../types/User";
import { generatePayload } from "../../utils/generatePayload";
import { CacheEngine } from "../abstract/cacheEngine";

export class PrismaCache extends CacheEngine {
  private db = new PrismaClient();

  constructor(private provider: string) {
    super();
  }

  async fetch(src: string, srcLang: string, destLang: string) {
    const result = await this.db.translate.findUnique({
      where: {
        hash_provider: {
          hash: CacheEngine.generateHashKey(src, srcLang, destLang),
          provider: this.provider,
        },
      },
    });
    if (!result) throw new Error("MISS");
    return generatePayload(
      true,
      result.level,
      result.src,
      result.dest,
      result.srcLang,
      result.destLang,
      this.provider
    );
  }

  async insert(payload: Payload) {
    const hashKey = CacheEngine.generateHashKey(
      payload.src,
      payload.srcLang,
      payload.destLang
    );
    const result = await this.db.translate.upsert({
      where: {
        hash_provider: {
          hash: hashKey,
          provider: this.provider,
        },
      },
      create: {
        hash: hashKey,
        src: payload.src,
        srcLang: payload.srcLang,
        dest: payload.dest,
        destLang: payload.destLang,
        level: payload.level,
        privacy: USER.PrivacyLabel.public,
        provider: this.provider,
      },
      update: {
        dest: payload.dest,
      },
    });
    return result;
  }
}
