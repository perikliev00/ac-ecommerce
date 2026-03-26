const SUPPORTED_LOCALES = ['bg', 'en', 'de', 'ru'];
const SUFFIX_LOCALES = ['en', 'de', 'ru'];

const LOCALE_META = {
  bg: { code: 'bg', htmlLang: 'bg', label: 'Bulgarian', nativeLabel: 'Български' },
  en: { code: 'en', htmlLang: 'en', label: 'English', nativeLabel: 'English' },
  de: { code: 'de', htmlLang: 'de', label: 'German', nativeLabel: 'Deutsch' },
  ru: { code: 'ru', htmlLang: 'ru', label: 'Russian', nativeLabel: 'Русский' },
};

function isExternalUrl(value) {
  return /^(?:[a-z]+:)?\/\//i.test(String(value || '')) || /^(?:mailto|tel|javascript):/i.test(String(value || ''));
}

function splitUrlParts(input) {
  const value = String(input || '/');
  const hashIndex = value.indexOf('#');
  const beforeHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : value.slice(hashIndex);
  const queryIndex = beforeHash.indexOf('?');
  const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex);
  return { pathname: pathname || '/', query, hash };
}

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/';
  const cleaned = String(pathname).replace(/\/{2,}/g, '/');
  if (cleaned === '/') return '/';
  return cleaned.endsWith('/') ? cleaned.slice(0, -1) || '/' : cleaned;
}

function detectLocaleFromPath(pathname) {
  const normalized = normalizePath(pathname);
  if (/^\/index-(en|de|ru)$/i.test(normalized)) {
    return normalized.slice(-2).toLowerCase();
  }
  const match = normalized.match(/-(en|de|ru)$/i);
  return match ? match[1].toLowerCase() : 'bg';
}

function stripLocaleSuffix(pathname) {
  const normalized = normalizePath(pathname);
  if (normalized === '/') return '/';
  if (/^\/index-(en|de|ru)$/i.test(normalized)) return '/';
  return normalized.replace(/-(en|de|ru)$/i, '') || '/';
}

function localizePath(inputPath, locale = 'bg') {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'bg';
  if (!inputPath) return safeLocale === 'bg' ? '/' : `/index-${safeLocale}`;
  if (isExternalUrl(inputPath)) return inputPath;

  const { pathname, query, hash } = splitUrlParts(inputPath);
  if (pathname.startsWith('/assets/') || pathname.startsWith('/public/') || pathname.startsWith('/favicon') || pathname === '/robots.txt' || pathname === '/sitemap.xml' || pathname === '/site.webmanifest') {
    return pathname + query + hash;
  }

  const basePath = stripLocaleSuffix(pathname);
  if (safeLocale === 'bg') return basePath + query + hash;
  if (basePath === '/') return `/index-${safeLocale}${query}${hash}`;
  return `${basePath}-${safeLocale}${query}${hash}`;
}

function getLocaleMeta(locale) {
  return LOCALE_META[SUPPORTED_LOCALES.includes(locale) ? locale : 'bg'];
}

function getLanguageSwitcherLinks(currentPath) {
  return SUPPORTED_LOCALES.map((locale) => ({
    ...getLocaleMeta(locale),
    href: localizePath(currentPath || '/', locale),
    current: locale === detectLocaleFromPath(currentPath || '/'),
  }));
}

function registerLocalizedStaticRoute(router, path, handler) {
  router.get(path, handler);
  SUFFIX_LOCALES.forEach((locale) => {
    const localized = path === '/' ? `/index-${locale}` : `${path}-${locale}`;
    router.get(localized, handler);
  });
}

function localizedViewName(baseView, locale = 'bg') {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : 'bg';
  return safeLocale === 'bg' ? baseView : `${baseView}-${safeLocale}`;
}

module.exports = {
  SUPPORTED_LOCALES,
  SUFFIX_LOCALES,
  LOCALE_META,
  detectLocaleFromPath,
  stripLocaleSuffix,
  localizePath,
  getLocaleMeta,
  getLanguageSwitcherLinks,
  registerLocalizedStaticRoute,
  localizedViewName,
};
