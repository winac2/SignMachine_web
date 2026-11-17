"use client";

import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-md px-3 py-2 text-sm transition ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        aria-pressed={language === "en"}
      >
        🇬🇧 EN
      </button>

      <button
        onClick={() => setLanguage("vi")}
        className={`rounded-md px-3 py-2 text-sm transition ${
          language === "vi"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        aria-pressed={language === "vi"}
      >
        🇻🇳 VI
      </button>
    </div>
  );
}