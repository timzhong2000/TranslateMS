import ISO639_1 from "../../types/ISO963";

export const LangList: {
  src: { name: string; value: ISO639_1 }[];
  dest: { name: string; value: ISO639_1 }[];
} = {
  src: [
    { name: "英语", value: "en" },
    { name: "日语", value: "ja" },
    { name: "简体中文", value: "zh_CN" },
    { name: "繁体中文", value: "zh_TW" },
    { name: "西班牙语", value: "es" },
    { name: "俄语", value: "ru" },
    { name: "韩语", value: "ko" },
    { name: "法语", value: "fr" },
    { name: "世界语", value: "eo" },
  ],
  dest: [
    { name: "简体中文", value: "zh_CN" },
    { name: "繁体中文", value: "zh_TW" },
    { name: "日语", value: "ja" },
    { name: "英语", value: "en" },
    { name: "西班牙语", value: "es" },
    { name: "俄语", value: "ru" },
    { name: "韩语", value: "ko" },
    { name: "法语", value: "fr" },
    { name: "世界语", value: "eo" },
  ],
};

export const caiyunLangList: {
  src: { name: string; value: ISO639_1 }[];
  dest: { name: string; value: ISO639_1 }[];
} = {
  src: [
    { name: "英语", value: "en" },
    { name: "日语", value: "ja" },
    { name: "简体中文", value: "zh_CN" },
  ],
  dest: [
    { name: "简体中文", value: "zh_CN" },
    { name: "繁体中文", value: "zh_TW" },
    { name: "日语", value: "ja" },
  ],
};
