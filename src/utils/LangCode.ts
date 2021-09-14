import ISO639_1 from "../types/ISO963";

export function getBaiduLangCode(code: ISO639_1 | "auto") {
  switch (code) {
    case "auto":
      return "auto";
    case "zh_CN":
      return "zh";
    case "zh_TW":
      return "cht";
    case "en":
      return "en";
    case "ja":
      return "jp";
    case "ru":
      return "ru";
    case "ko":
      return "kor";
    case "fr":
      return "fra";
    case "eo":
      return "epo";
    case "es":
      return "spa";
    default:
      throw new Error("Unsupport Language");
  }
}

export function getGoogleLangCode(code: ISO639_1 | "auto") {
  if (code === "zh_CN") return "zh";
  if (code === "zh_TW") return "zh-TW";
  if (code === "auto") throw new Error("Google Dont Support AUTO");
  return code;
}

// 未加入粤语与外蒙语的代号
export const getXunfeiLangCode = (code: ISO639_1) => {
  switch (code) {
    // case "yue":
    // case "nm":
    case "zh_CN":
      return "cn";
    case "kk":
      return "kka";
    case "fa":
    case "si":
    case "en":
    case "fi":
    case "sk":
    case "ii":
    case "he":
    case "sl":
    case "hi":
    case "sr":
    case "ja":
    case "hr":
    case "su":
    case "ru":
    case "hu":
    case "sv":
    case "fr":
    case "hy":
    case "sw":
    case "es":
    case "id":
    case "ta":
    case "ar":
    case "is":
    case "te":
    case "ug": //（需申请开通）
    case "it":
    case "tl":
    case "za": //（需申请开通）
    case "jv":
    case "tr":
    case "vi":
    case "ka":
    case "uk":
    case "th":
    case "km":
    case "ur":
    case "ko":
    case "lo":
    case "zu":
    case "de":
    case "lt":
    case "mn":
    case "lv":
    case "my":
    case "af":
    case "ml":
    case "am":
    case "mr":
    case "ps":
    case "az":
    case "nb":
    case "ha":
    case "bn":
    case "ne":
    case "uz":
    case "ca":
    case "nl":
    case "tk":
    case "cs":
    case "pl":
    case "tg":
    case "da":
    case "pt":
    case "bg":
    case "el":
    case "ro":
    case "ms":
      return code;
    default:
      throw new Error("Unsupport Language");
  }
};

export const getTencentLangCode = (code: ISO639_1 | "auto") => {
  switch (code) {
    case "zh_CN":
      return "zh";
    case "zh_TW":
      return "zh-TW";
    case "auto":
    case "en":
    case "ja":
    case "ko":
    case "fr":
    case "es":
    case "it":
    case "de":
    case "tr":
    case "ru":
    case "pt":
    case "vi":
    case "id":
    case "th":
    case "ms":
    case "ar":
    case "hi":
      return code;
    default:
      throw new Error("Unsupport Language");
  }
};
