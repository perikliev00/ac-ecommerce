const { buildSeo, mergeJsonLd } = require('../lib/seo');

async function getAbout(req, res, next) {
  try {
    const seo = buildSeo({
      req,
      title: 'За нас – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
      description: 'NesebarClima – магазин и сервиз за климатици в Несебър. От 2009 г. продажба, монтаж и ремонт в Несебър, Слънчев бряг, Равда и Свети Влас.',
      canonicalPath: '/about',
      jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'За нас', url: '/about' }] }),
    });
    res.render('about', seo);
  } catch (err) {
    next(err);
  }
}

async function getUslugi(req, res, next) {
  try {
    const seo = buildSeo({
      req,
      title: 'Услуги – Монтаж и сервиз на климатици Несебър | Несебър Клима',
      description: 'Монтаж, сервиз, профилактика и ремонт на климатици в Несебър, Слънчев бряг, Равда и Свети Влас. Професионално обслужване.',
      canonicalPath: '/uslugi',
      jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Услуги', url: '/uslugi' }] }),
    });
    res.render('uslugi', seo);
  } catch (err) {
    next(err);
  }
}

function getError(req, res, next) {
  try {
    const code = Math.min(599, Math.max(400, parseInt(req.query.code, 10) || 500));
    const message = (req.query.message && String(req.query.message).trim()) || (code === 404 ? 'Страницата не е намерена.' : 'Възникна грешка. Моля, опитайте отново по-късно.');
    res.status(code).render('error', {
      title: `Грешка ${code} – Несебър Клима`,
      description: message,
      statusCode: code,
      message,
      is404: code === 404,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAbout,
  getUslugi,
  getError,
};
