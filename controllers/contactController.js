const ContactRequest = require('../models/ContactRequest');
const { isConnected } = require('../lib/db');
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

async function getKontakti(req, res, next) {
  try {
    const sent = req.query.sent === '1';
    const error = req.query.error || null;
    const formData = buildFormData();
    const seo = buildSeo({
      req,
      title: 'Контакти – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
      description: 'Свържете се с нас за оферта, монтаж или сервиз на климатици. Обслужваме Несебър, Слънчев бряг, Равда и Свети Влас.',
      canonicalPath: '/kontakti',
      jsonLd: mergeJsonLd(req, {
        breadcrumbs: [
          { name: 'Начало', url: '/' },
          { name: 'Контакти', url: '/kontakti' },
        ],
      }),
    });
    res.render('kontakti', { sent, error, formData, ...seo });
  } catch (err) {
    next(err);
  }
}

async function postKontakti(req, res, next) {
  try {
    const formData = buildFormData(req.body);
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Моля, въведете име.');
    }
    if (!formData.email.trim()) {
      errors.push('Моля, въведете имейл.');
    }

    if (errors.length > 0) {
      const seo = buildSeo({
        req,
        title: 'Контакти – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
        description: 'Свържете се с нас за оферта, монтаж или сервиз на климатици.',
        canonicalPath: '/kontakti',
        jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Контакти', url: '/kontakti' }] }),
      });
      return res.status(400).render('kontakti', {
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
        canonicalPath: '/kontakti',
        jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Контакти', url: '/kontakti' }] }),
      });
      return res.status(503).render('kontakti', {
        sent: false,
        error: 'Базата данни не е достъпна. Моля, опитайте отново по-късно.',
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

    return res.redirect('/kontakti?sent=1');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getKontakti,
  postKontakti,
};

