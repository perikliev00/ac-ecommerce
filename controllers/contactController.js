const ContactRequest = require('../models/ContactRequest');
const { isConnected } = require('../lib/db');
const { localizePath, localizedViewName } = require('../lib/i18n');
const { buildSeo, mergeJsonLd } = require('../lib/seo');

function buildFormData(source) {
  const body = source || {};
  return {
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    subject: body.subject || '',
  };
}

function getContactErrorText(locale, key) {
  const messages = {
    missingName: {
      bg: 'Моля, въведете име.',
      en: 'Please enter your name.',
      de: 'Bitte geben Sie Ihren Namen ein.',
      ru: 'Пожалуйста, введите ваше имя.',
    },
    missingEmail: {
      bg: 'Моля, въведете имейл.',
      en: 'Please enter your email.',
      de: 'Bitte geben Sie Ihre E-Mail ein.',
      ru: 'Пожалуйста, введите ваш email.',
    },
    dbUnavailable: {
      bg: 'Базата данни не е достъпна. Моля, опитайте отново по-късно.',
      en: 'The database is unavailable. Please try again later.',
      de: 'Die Datenbank ist nicht verfügbar. Bitte versuchen Sie es später erneut.',
      ru: 'База данных недоступна. Пожалуйста, попробуйте позже.',
    },
  };
  return (messages[key] && messages[key][locale]) || (messages[key] && messages[key].bg) || '';
}

async function getKontakti(req, res, next) {
  try {
    const sent = req.query.sent === '1';
    const error = req.query.error || null;
    const formData = buildFormData();
    const seo = buildSeo({
      req,
      title: 'Контакти – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
      description: 'Свържете се с нас за оферта, монтаж или сервиз на климатици. Обслужваме Несебър, Слънчев бряг, Равда и Свети Влас.',
      canonicalPath: localizePath('/kontakti', req.locale),
      jsonLd: mergeJsonLd(req, {
        breadcrumbs: [
          { name: 'Начало', url: localizePath('/', req.locale) },
          { name: 'Контакти', url: localizePath('/kontakti', req.locale) },
        ],
      }),
    });
    res.render(localizedViewName('kontakti', req.locale), { sent, error, formData, ...seo });
  } catch (err) {
    next(err);
  }
}

async function postKontakti(req, res, next) {
  try {
    const formData = buildFormData(req.body);
    const errors = [];

    if (!formData.name.trim()) {
      errors.push(getContactErrorText(req.locale, 'missingName'));
    }
    if (!formData.email.trim()) {
      errors.push(getContactErrorText(req.locale, 'missingEmail'));
    }

    if (errors.length > 0) {
      const seo = buildSeo({
        req,
        title: 'Контакти – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
        description: 'Свържете се с нас за оферта, монтаж или сервиз на климатици.',
        canonicalPath: localizePath('/kontakti', req.locale),
        jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: localizePath('/', req.locale) }, { name: 'Контакти', url: localizePath('/kontakti', req.locale) }] }),
      });
      return res.status(400).render(localizedViewName('kontakti', req.locale), {
        sent: false,
        error: errors.join(' '),
        formData,
        ...seo,
      });
    }

    if (!isConnected()) {
      const seo = buildSeo({
        req,
        title: 'Контакти – Климатици Несебър | Несебър Клима',
        description: 'Свържете се с нас за оферта, монтаж или сервиз на климатици.',
        canonicalPath: localizePath('/kontakti', req.locale),
        jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: localizePath('/', req.locale) }, { name: 'Контакти', url: localizePath('/kontakti', req.locale) }] }),
      });
      return res.status(503).render(localizedViewName('kontakti', req.locale), {
        sent: false,
        error: getContactErrorText(req.locale, 'dbUnavailable'),
        formData,
        ...seo,
      });
    }

    const doc = new ContactRequest({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject.trim(),
    });
    await doc.save();

    return res.redirect(localizePath('/kontakti?sent=1', req.locale));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getKontakti,
  postKontakti,
};

