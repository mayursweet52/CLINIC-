"use client";
import { useLang, Lang } from "@/context/LanguageContext";

const flags: Record<Lang, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  mr: "🇮🇳",
};

const labels: Record<Lang, string> = {
  en: "EN",
  hi: "हिं",
  mr: "मरा",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      {(["en", "hi", "mr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            lang === l
              ? "bg-white text-blue-600 shadow-sm border border-blue-100"
              : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
          }`}
          title={l === "en" ? "English" : l === "hi" ? "हिंदी" : "मराठी"}
        >
          <span>{flags[l]}</span>
          <span>{labels[l]}</span>
        </button>
      ))}
    </div>
  );
}
