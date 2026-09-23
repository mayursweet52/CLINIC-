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
    <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl p-1 border border-slate-300 dark:border-slate-700">
      {(["en", "hi", "mr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            lang === l
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
