// ─── Supported languages ─────────────────────────────────────────────────────
//
// To add a language:
//   1. Create `locales/<code>.json` (copy the keys you have translations for
//      from `en.json`; anything missing falls back to English).
//   2. Add an entry below and register the file in `locales/index.js`.
//   3. Run `npm run i18n:check` to see what still needs translating.
//
// `code` follows ISO 639 (e.g. `sat` = Santali). `nativeName` is how the
// language names itself (from Unicode CLDR where available). `script` is the
// writing system the translations use, shown in the language picker.
// `intlLocale` is used for dates and numbers; if the device has no data for
// it, formatting falls back to English.

export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    intlLocale: 'en-US',
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki',
    intlLocale: 'sat-Olck-IN',
  },
];

export const DEFAULT_LANGUAGE = 'en';

export const findLanguage = (code) => LANGUAGES.find((l) => l.code === code);
