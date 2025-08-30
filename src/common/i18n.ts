import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { EN_TRANSLATION } from './locals/en';
import { HI_TRANSLATION } from './locals/hi';

const resources = {
  en: { translation: EN_TRANSLATION },
  hi: { translation: HI_TRANSLATION },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: ['en', 'he'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
