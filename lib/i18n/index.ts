import { createInstance } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import { useCallback, useEffect, useState } from "react";
import ptBR from "./locales/pt-BR";

import en from "./locales/en";
import es from "./locales/es";

const LANGUAGE_STORAGE_KEY = "@signalsense/language";
const SUPPORTED_LANGUAGES = {
  "pt-BR": { name: "Português (Brasil)", locale: "pt-BR" },
  en: { name: "English", locale: "en" },
  es: { name: "Español", locale: "es" },
} as const;

type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Map app i18n keys to BCP-47 tags accepted by Intl/Date toLocale* APIs.
const INTL_LOCALE_MAP: Record<string, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

function getIntlLocale(locale: string): string {
  return INTL_LOCALE_MAP[locale] ?? "en-US";
}

// Detects device language
function getDeviceLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0]?.languageTag ?? "en";

  if (deviceLocale.startsWith("pt")) return "pt-BR";
  if (deviceLocale.startsWith("es")) return "es";

  return "en";
}

// Creates and initializes an instance of i18next
const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
    en: { translation: en },
    es: { translation: es },
  },
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React Native already handles escape
  },
  react: {
    useSuspense: false, // Disable Suspense for React Native
  },
});

// A custom hook that extends useTranslation with extra functionality
function useI18n() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Loads saved language from AsyncStorage on startup
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLocale) => {
      if (savedLocale && savedLocale in SUPPORTED_LANGUAGES) {
        i18n.changeLanguage(savedLocale);
      }

      setIsLoading(false);
    });
  }, [i18n]);

  // Function to change the language
  const setLocale = useCallback(
    (newLocale: SupportedLanguage) => {
      i18n.changeLanguage(newLocale);
      AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
    },
    [i18n],
  );

  return {
    t,
    locale: i18n.language as SupportedLanguage,
    setLocale,
    isLoading,
  };
}

export { getIntlLocale, i18n, SUPPORTED_LANGUAGES, SupportedLanguage, useI18n };
