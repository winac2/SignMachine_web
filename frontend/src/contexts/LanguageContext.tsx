"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import en from "@/locales/en";
import vi from "@/locales/vi";

export type Language = "en" | "vi";

const translations = {
  en,
  vi,
};

type Translation = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>("en");

  const [mounted, setMounted] = useState(false);

  // Đọc ngôn ngữ đã lưu sau khi component được mount
  useEffect(() => {
    const savedLanguage =
      localStorage.getItem("signmachine_language");

    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguageState(savedLanguage);
    }

    setMounted(true);
    document.documentElement.lang = savedLanguage || "en";
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);

    localStorage.setItem(
      "signmachine_language",
      newLanguage
    );
    document.documentElement.lang = newLanguage;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  // Tránh render nội dung khác nhau giữa server và client
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}