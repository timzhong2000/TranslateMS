import { Payload, TranslateLevel } from "../types/Translator";

export function generatePayload(
  success: boolean,
  level: TranslateLevel,
  src: string,
  dest: string,
  srcLang: string,
  destLang: string,
  provider: string
): Payload {
  return {
    success: success,
    level: level,
    provider: { uid: -1, name: provider },
    src: src,
    dest: dest,
    srcLang: srcLang,
    destLang: destLang,
  };
}
