const { buildSeo, mergeJsonLd, getBaseUrl } = require('../lib/seo');
const { localizePath, localizedViewName } = require('../lib/i18n');

async function getAbout(req, res, next) {
  try {
    const seo = buildSeo({
      req,
      title: 'За нас – Климатици Несебър | Продажба, Монтаж, Сервиз | Несебър Клима',
      description: 'NesebarClima – магазин и сервиз за климатици в Несебър. От 2009 г. продажба, монтаж и ремонт в Несебър, Слънчев бряг, Равда и Свети Влас.',
      canonicalPath: localizePath('/about', req.locale),
      jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: localizePath('/', req.locale) }, { name: 'За нас', url: localizePath('/about', req.locale) }] }),
    });
    res.render(localizedViewName('about', req.locale), seo);
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
      canonicalPath: localizePath('/uslugi', req.locale),
      jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: 'Начало', url: localizePath('/', req.locale) }, { name: 'Услуги', url: localizePath('/uslugi', req.locale) }] }),
    });
    res.render(localizedViewName('uslugi', req.locale), seo);
  } catch (err) {
    next(err);
  }
}

/** List of blog posts for the index page (slug, title, excerpt, image, date, isPlaceholder). */
const BLOG_POSTS = [
  {
    slug: 'freon-ceni-2026',
    url: '/blog/freon-ceni-2026',
    title: 'Колко струва зареждането на фреон за климатик в България (2026)',
    excerpt: 'Ориентировъчни цени за зареждане на фреон за битов и автомобилен климатик – труд, диагностика, ремонт на течове.',
    image: '/assets/images/freon.jpg',
    imageAlt: 'Фреон – цени 2026',
    author: 'Екипът на Несебър Клима',
    category: 'Сервиз',
    readTime: '4 мин. четене',
    date: '19.02.2026',
    isPlaceholder: false,
  },
  {
    slug: 'montaz-klimatitsi',
    url: '/blog/montaz-klimatitsi',
    title: 'Монтаж на климатици: стъпки, изисквания и професионални съвети',
    excerpt: 'Защо правилният монтаж е критичен, как да се подготвите, основни стъпки и какво да очаквате от професионален сервиз.',
    image: '/assets/images/montaj.jpeg',
    imageAlt: 'Монтаж на климатици',
    author: 'Екипът на Несебър Клима',
    category: 'Монтаж',
    readTime: '5 мин. четене',
    date: '19.02.2026',
    isPlaceholder: false,
  },
  {
    slug: 'profilaktika-klimatitsi',
    url: '/blog/profilaktika-klimatitsi',
    title: 'Профилактика на климатик – колко често и какво включва?',
    excerpt: 'Редовната профилактика гарантира по-нисък разход на ток, по-добро охлаждане и по-дълъг живот на уреда. Препоръки и какво включва обслужването.',
    image: '/assets/images/profilaktika.jpg',
    imageAlt: 'Профилактика на климатик',
    author: 'Екипът на Несебър Клима',
    category: 'Поддръжка',
    readTime: '4 мин. четене',
    date: '19.02.2026',
    isPlaceholder: false,
  },
  {
    slug: 'inverter-vs-obiknoven',
    url: '/blog/inverter-vs-obiknoven',
    title: 'Инверторен срещу обикновен климатик – кой е по-добър избор?',
    excerpt: 'Разлики между on/off и инверторен климатик: разход на ток, комфорт, шум и цена. Кой да изберете според нуждите и бюджета.',
    image: '/assets/images/invertoriliobiknoven.jpg',
    imageAlt: 'Инверторен срещу обикновен климатик',
    author: 'Екипът на Несебър Клима',
    category: 'Съвети',
    readTime: '3 мин. четене',
    date: '19.02.2026',
    isPlaceholder: false,
  },
];

function getBlogPostsForLocale(locale = 'bg') {
  if (locale === 'en') {
    return [
      {
        slug: 'freon-ceni-2026',
        url: '/blog/freon-ceni-2026',
        title: 'How much does refrigerant refill for an air conditioner cost in Bulgaria (2026)',
        excerpt: 'Estimated prices for refrigerant refill for home and car air conditioners: labour, diagnostics and leak repair.',
        image: '/assets/images/freon.jpg',
        imageAlt: 'Refrigerant prices 2026',
        author: 'NessebarClima team',
        category: 'Service',
        readTime: '4 min read',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'montaz-klimatitsi',
        url: '/blog/montaz-klimatitsi',
        title: 'Air conditioner installation: steps, requirements and professional advice',
        excerpt: 'Why proper installation is critical, how to prepare, the main steps and what to expect from a professional service.',
        image: '/assets/images/montaj.jpeg',
        imageAlt: 'Air conditioner installation',
        author: 'NessebarClima team',
        category: 'Installation',
        readTime: '5 min read',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'profilaktika-klimatitsi',
        url: '/blog/profilaktika-klimatitsi',
        title: 'Air conditioner maintenance: how often and what does it include?',
        excerpt: 'Regular maintenance means lower electricity use, better cooling and a longer unit lifespan.',
        image: '/assets/images/profilaktika.jpg',
        imageAlt: 'Air conditioner maintenance',
        author: 'NessebarClima team',
        category: 'Maintenance',
        readTime: '4 min read',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'inverter-vs-obiknoven',
        url: '/blog/inverter-vs-obiknoven',
        title: 'Inverter vs standard air conditioner: which is the better choice?',
        excerpt: 'Key differences between on/off and inverter air conditioners: energy use, comfort, noise and price.',
        image: '/assets/images/invertoriliobiknoven.jpg',
        imageAlt: 'Inverter vs standard air conditioner',
        author: 'NessebarClima team',
        category: 'Tips',
        readTime: '3 min read',
        date: '19.02.2026',
        isPlaceholder: false,
      },
    ];
  }

  if (locale === 'de') {
    return [
      {
        slug: 'freon-ceni-2026',
        url: '/blog/freon-ceni-2026',
        title: 'Was kostet das Nachfüllen von Kältemittel für eine Klimaanlage in Bulgarien (2026)',
        excerpt: 'Richtpreise für das Nachfüllen von Kältemittel bei Haus- und Auto-Klimaanlagen: Arbeit, Diagnose und Leckreparatur.',
        image: '/assets/images/freon.jpg',
        imageAlt: 'Kältemittel Preise 2026',
        author: 'NessebarClima Team',
        category: 'Service',
        readTime: '4 Min. Lesezeit',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'montaz-klimatitsi',
        url: '/blog/montaz-klimatitsi',
        title: 'Montage von Klimaanlagen: Schritte, Anforderungen und professionelle Tipps',
        excerpt: 'Warum die richtige Montage entscheidend ist, wie Sie sich vorbereiten und was Sie von einem professionellen Service erwarten können.',
        image: '/assets/images/montaj.jpeg',
        imageAlt: 'Montage von Klimaanlagen',
        author: 'NessebarClima Team',
        category: 'Montage',
        readTime: '5 Min. Lesezeit',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'profilaktika-klimatitsi',
        url: '/blog/profilaktika-klimatitsi',
        title: 'Wartung der Klimaanlage: wie oft und was ist enthalten?',
        excerpt: 'Regelmäßige Wartung bedeutet geringeren Stromverbrauch, bessere Kühlung und längere Lebensdauer.',
        image: '/assets/images/profilaktika.jpg',
        imageAlt: 'Wartung der Klimaanlage',
        author: 'NessebarClima Team',
        category: 'Wartung',
        readTime: '4 Min. Lesezeit',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'inverter-vs-obiknoven',
        url: '/blog/inverter-vs-obiknoven',
        title: 'Inverter oder Standard-Klimaanlage: was ist die bessere Wahl?',
        excerpt: 'Die wichtigsten Unterschiede zwischen On/Off- und Inverter-Klimaanlagen: Energieverbrauch, Komfort, Lautstärke und Preis.',
        image: '/assets/images/invertoriliobiknoven.jpg',
        imageAlt: 'Inverter oder Standard-Klimaanlage',
        author: 'NessebarClima Team',
        category: 'Tipps',
        readTime: '3 Min. Lesezeit',
        date: '19.02.2026',
        isPlaceholder: false,
      },
    ];
  }

  if (locale === 'ru') {
    return [
      {
        slug: 'freon-ceni-2026',
        url: '/blog/freon-ceni-2026',
        title: 'Сколько стоит заправка кондиционера фреоном в Болгарии (2026)',
        excerpt: 'Ориентировочные цены на заправку бытовых и автомобильных кондиционеров фреоном: работа, диагностика и ремонт утечек.',
        image: '/assets/images/freon.jpg',
        imageAlt: 'Цены на фреон 2026',
        author: 'Команда NessebarClima',
        category: 'Сервис',
        readTime: '4 мин. чтения',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'montaz-klimatitsi',
        url: '/blog/montaz-klimatitsi',
        title: 'Монтаж кондиционеров: этапы, требования и профессиональные советы',
        excerpt: 'Почему правильный монтаж так важен, как подготовиться и чего ожидать от профессионального сервиса.',
        image: '/assets/images/montaj.jpeg',
        imageAlt: 'Монтаж кондиционеров',
        author: 'Команда NessebarClima',
        category: 'Монтаж',
        readTime: '5 мин. чтения',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'profilaktika-klimatitsi',
        url: '/blog/profilaktika-klimatitsi',
        title: 'Профилактика кондиционера: как часто и что в нее входит?',
        excerpt: 'Регулярное обслуживание означает меньший расход электроэнергии, лучшее охлаждение и более долгий срок службы.',
        image: '/assets/images/profilaktika.jpg',
        imageAlt: 'Профилактика кондиционера',
        author: 'Команда NessebarClima',
        category: 'Обслуживание',
        readTime: '4 мин. чтения',
        date: '19.02.2026',
        isPlaceholder: false,
      },
      {
        slug: 'inverter-vs-obiknoven',
        url: '/blog/inverter-vs-obiknoven',
        title: 'Инверторный или обычный кондиционер: что выбрать?',
        excerpt: 'Основные различия между on/off и инверторными кондиционерами: расход энергии, комфорт, шум и цена.',
        image: '/assets/images/invertoriliobiknoven.jpg',
        imageAlt: 'Инверторный или обычный кондиционер',
        author: 'Команда NessebarClima',
        category: 'Советы',
        readTime: '3 мин. чтения',
        date: '19.02.2026',
        isPlaceholder: false,
      },
    ];
  }

  return BLOG_POSTS;
}

function getBlogIndexMeta(locale = 'bg') {
  if (locale === 'en') {
    return {
      title: 'Blog - Air conditioners, service and advice | NessebarClima',
      description: 'Articles about air conditioners, refrigerant refill, installation and maintenance in Nessebar and the region.',
      homeLabel: 'Home',
      blogLabel: 'Blog',
    };
  }
  if (locale === 'de') {
    return {
      title: 'Blog - Klimaanlagen, Service und Tipps | NessebarClima',
      description: 'Artikel über Klimaanlagen, Kältemittelnachfüllung, Montage und Wartung in Nessebar und der Region.',
      homeLabel: 'Startseite',
      blogLabel: 'Blog',
    };
  }
  if (locale === 'ru') {
    return {
      title: 'Блог - кондиционеры, сервис и советы | NessebarClima',
      description: 'Статьи о кондиционерах, заправке фреоном, монтаже и профилактике в Несебре и регионе.',
      homeLabel: 'Главная',
      blogLabel: 'Блог',
    };
  }

  return {
    title: 'Блог – Климатици, сервиз и съвети | Несебър Клима',
    description: 'Статии за климатици, зареждане на фреон, монтаж и профилактика в Несебър и региона.',
    homeLabel: 'Начало',
    blogLabel: 'Блог',
  };
}

function getBlogArticleMeta(article, locale = 'bg') {
  const normalizedLocale = ['en', 'de', 'ru'].includes(locale) ? locale : 'bg';
  const meta = {
    freon: {
      bg: {
        homeLabel: 'Начало',
        blogLabel: 'Блог',
        breadcrumb: 'Фреон цени 2026',
        headline: 'Колко струва зареждането на фреон за климатик в България (2026)',
        title: 'Колко струва зареждането на фреон за климатик в България (2026) | Несебър Клима',
        description: 'Ориентировъчни цени за зареждане на фреон за битов и автомобилен климатик в България за 2026 г. – труд, диагностика, ремонт на течове.',
        faq: [
          {
            question: 'Колко струва зареждането на фреон за битов климатик?',
            answer: 'Ориентировъчно 25–35 лв. за 100 г при допълване без теч; с диагностика и вакуум около 30–35 € за 100 г. Крайната цена зависи от типа фреон и от сервиза.',
          },
          {
            question: 'Защо не трябва само да се пълни фреон при теч?',
            answer: 'При наличие на теч газът отново ще изтече и проблемът остава. Първо се открива и отстранява течът, после се прави вакуум и зареждане.',
          },
          {
            question: 'Какво влияе на цената за зареждане на фреон?',
            answer: 'Количеството газ, типът фреон, дали е включена диагностика и вакуум, и дали е нужен ремонт на теч. Допълнителните услуги увеличават общата сума.',
          },
        ],
      },
      en: {
        homeLabel: 'Home',
        blogLabel: 'Blog',
        breadcrumb: 'Refrigerant Prices 2026',
        headline: 'How much does refrigerant refill for an air conditioner cost in Bulgaria (2026)',
        title: 'How much does refrigerant refill for an air conditioner cost in Bulgaria (2026) | NessebarClima',
        description: 'Estimated prices for refrigerant refill for home and car air conditioners in Bulgaria in 2026, including labour, diagnostics and leak repair.',
        faq: [
          {
            question: 'How much does refrigerant refill cost for a home air conditioner?',
            answer: 'Usually around BGN 25-35 per 100 g for top-up without leaks; with diagnostics and vacuuming, around EUR 30-35 per 100 g. The final price depends on the refrigerant type and the service company.',
          },
          {
            question: 'Why should you not only top up refrigerant when there is a leak?',
            answer: 'If the system has a leak, the gas will escape again and the problem remains. The leak should be found and repaired first, then the system is vacuumed and refilled.',
          },
          {
            question: 'What affects refrigerant refill pricing?',
            answer: 'The gas quantity, refrigerant type, whether diagnostics and vacuuming are included, and whether leak repair is needed. Extra services increase the total price.',
          },
        ],
      },
      de: {
        homeLabel: 'Startseite',
        blogLabel: 'Blog',
        breadcrumb: 'Kältemittel Preise 2026',
        headline: 'Was kostet das Nachfüllen von Kältemittel für eine Klimaanlage in Bulgarien (2026)',
        title: 'Was kostet das Nachfüllen von Kältemittel für eine Klimaanlage in Bulgarien (2026) | NessebarClima',
        description: 'Richtpreise für das Nachfüllen von Kältemittel bei Haus- und Auto-Klimaanlagen in Bulgarien im Jahr 2026, einschließlich Arbeit, Diagnose und Leckreparatur.',
        faq: [
          {
            question: 'Was kostet das Nachfüllen von Kältemittel bei einer Haushalts-Klimaanlage?',
            answer: 'Meist etwa 25-35 BGN pro 100 g ohne Leck; mit Diagnose und Vakuumierung etwa 30-35 EUR pro 100 g. Der Preis hängt vom Kältemitteltyp und vom Servicebetrieb ab.',
          },
          {
            question: 'Warum sollte man bei einem Leck nicht nur Kältemittel nachfüllen?',
            answer: 'Wenn das System undicht ist, entweicht das Gas erneut. Deshalb wird zuerst das Leck gefunden und repariert, danach wird vakuumiert und neu befüllt.',
          },
          {
            question: 'Welche Faktoren bestimmen den Preis?',
            answer: 'Gasmenge, Art des Kältemittels, enthaltene Diagnose- und Vakuumarbeiten sowie möglicher Reparaturbedarf. Zusätzliche Leistungen erhöhen die Gesamtsumme.',
          },
        ],
      },
      ru: {
        homeLabel: 'Главная',
        blogLabel: 'Блог',
        breadcrumb: 'Цены на фреон 2026',
        headline: 'Сколько стоит заправка кондиционера фреоном в Болгарии (2026)',
        title: 'Сколько стоит заправка кондиционера фреоном в Болгарии (2026) | NessebarClima',
        description: 'Ориентировочные цены на заправку бытовых и автомобильных кондиционеров в Болгарии в 2026 году, включая работу, диагностику и ремонт утечек.',
        faq: [
          {
            question: 'Сколько стоит заправка бытового кондиционера фреоном?',
            answer: 'Обычно около 25-35 левов за 100 г без утечки; с диагностикой и вакуумированием - около 30-35 евро за 100 г. Цена зависит от типа фреона и сервиса.',
          },
          {
            question: 'Почему нельзя просто дозаправить фреон при утечке?',
            answer: 'Если система негерметична, газ снова выйдет наружу. Сначала находят и устраняют утечку, затем систему вакуумируют и снова заправляют.',
          },
          {
            question: 'Что влияет на цену заправки фреоном?',
            answer: 'Количество газа, тип фреона, входит ли диагностика и вакуумирование, и нужен ли ремонт. Дополнительные услуги увеличивают общую стоимость.',
          },
        ],
      },
    },
    montaz: {
      bg: {
        homeLabel: 'Начало',
        blogLabel: 'Блог',
        breadcrumb: 'Монтаж на климатици',
        headline: 'Монтаж на климатици: стъпки, изисквания и професионални съвети',
        title: 'Монтаж на климатици: стъпки и съвети | Несебър Клима',
        description: 'Защо правилният монтаж е критичен. Подготовка, избор на място, основни стъпки и какво да очаквате от професионален сервиз.',
      },
      en: {
        homeLabel: 'Home',
        blogLabel: 'Blog',
        breadcrumb: 'Air conditioner installation',
        headline: 'Air conditioner installation: steps, requirements and professional advice',
        title: 'Air conditioner installation: steps and advice | NessebarClima',
        description: 'Why proper installation is critical. Preparation, placement, key steps and what to expect from a professional installer.',
      },
      de: {
        homeLabel: 'Startseite',
        blogLabel: 'Blog',
        breadcrumb: 'Montage von Klimaanlagen',
        headline: 'Montage von Klimaanlagen: Schritte, Anforderungen und professionelle Tipps',
        title: 'Montage von Klimaanlagen: Schritte und Tipps | NessebarClima',
        description: 'Warum die richtige Montage entscheidend ist. Vorbereitung, Standortwahl, Montageschritte und was man von einem Fachbetrieb erwarten sollte.',
      },
      ru: {
        homeLabel: 'Главная',
        blogLabel: 'Блог',
        breadcrumb: 'Монтаж кондиционеров',
        headline: 'Монтаж кондиционера: этапы, требования и профессиональные советы',
        title: 'Монтаж кондиционера: этапы и советы | NessebarClima',
        description: 'Почему правильный монтаж так важен. Подготовка, выбор места, основные этапы и что ожидать от профессиональной установки.',
      },
    },
    profilaktika: {
      bg: {
        homeLabel: 'Начало',
        blogLabel: 'Блог',
        breadcrumb: 'Профилактика на климатик',
        headline: 'Профилактика на климатик – колко често и какво включва?',
        title: 'Профилактика на климатик – колко често и какво включва? | Несебър Клима',
        description: 'Редовната профилактика на климатик – честота, какво включва обслужването и защо удължава живота на уреда и намалява разходите.',
        faq: [
          {
            question: 'Колко често трябва да се прави профилактика на климатик?',
            answer: 'За домашен климатик – поне 1 път годишно при сезонно ползване; 2 пъти годишно при целогодишно ползване. За офис или магазин – на всеки 6 месеца или по-често при интензивна работа.',
          },
          {
            question: 'Какво включва профилактиката на климатик?',
            answer: 'Почистване на филтри и вътрешно тяло, проверка на външното тяло и кондензатора, проверка на нивото на фреон и на дренажната система. При нужда – дезинфекция срещу бактерии и мухъл.',
          },
          {
            question: 'Защо профилактиката намалява разходите за ток?',
            answer: 'Замърсен климатик консумира с 10–30% повече енергия. Чистата система охлажда по-ефективно, работи по-кратко време и по-ниски са месечните сметки.',
          },
        ],
      },
      en: {
        homeLabel: 'Home',
        blogLabel: 'Blog',
        breadcrumb: 'Air conditioner maintenance',
        headline: 'Air conditioner maintenance: why regular servicing matters',
        title: 'Air conditioner maintenance: how often and what is included? | NessebarClima',
        description: 'Regular air conditioner maintenance: service frequency, what it includes and why it extends the unit lifespan and lowers running costs.',
        faq: [
          {
            question: 'How often should air conditioner maintenance be done?',
            answer: 'For a home air conditioner, at least once per year is recommended for seasonal use and twice per year for year-round use. Offices and shops may need servicing every 6 months or more often.',
          },
          {
            question: 'What does air conditioner maintenance include?',
            answer: 'Cleaning filters and the indoor unit, checking the outdoor unit and condenser, checking refrigerant level and the drain system, and disinfecting when needed.',
          },
          {
            question: 'Why does maintenance reduce electricity costs?',
            answer: 'A dirty air conditioner can consume 10-30% more energy. A clean system cools and heats more efficiently, works for less time and lowers monthly bills.',
          },
        ],
      },
      de: {
        homeLabel: 'Startseite',
        blogLabel: 'Blog',
        breadcrumb: 'Wartung der Klimaanlage',
        headline: 'Wartung der Klimaanlage: warum regelmäßiger Service wichtig ist',
        title: 'Wartung der Klimaanlage: wie oft und was ist enthalten? | NessebarClima',
        description: 'Regelmäßige Klimawartung: Wartungsintervalle, Leistungsumfang und warum sie die Lebensdauer verlängert und die Betriebskosten senkt.',
        faq: [
          {
            question: 'Wie oft sollte eine Klimaanlage gewartet werden?',
            answer: 'Für private Haushalte mindestens einmal pro Jahr bei saisonaler Nutzung und zweimal pro Jahr bei ganzjähriger Nutzung. Büros und Geschäfte brauchen oft alle 6 Monate oder häufiger Service.',
          },
          {
            question: 'Was umfasst die Wartung einer Klimaanlage?',
            answer: 'Reinigung von Filtern und Innengerät, Kontrolle von Außengerät und Kondensator, Prüfung von Kältemittelstand und Ablauf sowie bei Bedarf Desinfektion.',
          },
          {
            question: 'Warum senkt Wartung die Stromkosten?',
            answer: 'Eine verschmutzte Klimaanlage verbraucht 10-30% mehr Energie. Ein sauberes System arbeitet effizienter, läuft kürzer und senkt die monatlichen Kosten.',
          },
        ],
      },
      ru: {
        homeLabel: 'Главная',
        blogLabel: 'Блог',
        breadcrumb: 'Профилактика кондиционера',
        headline: 'Профилактика кондиционера: почему регулярный сервис важен',
        title: 'Профилактика кондиционера: как часто и что входит? | NessebarClima',
        description: 'Регулярная профилактика кондиционера: как часто делать сервис, что он включает и почему он продлевает срок службы и снижает расходы.',
        faq: [
          {
            question: 'Как часто нужно делать профилактику кондиционера?',
            answer: 'Для дома рекомендуется минимум один раз в год при сезонном использовании и два раза в год при круглогодичной работе. Для офиса или магазина сервис может требоваться каждые 6 месяцев или чаще.',
          },
          {
            question: 'Что входит в профилактику кондиционера?',
            answer: 'Чистка фильтров и внутреннего блока, проверка наружного блока и конденсатора, проверка уровня фреона и дренажа, а при необходимости - дезинфекция.',
          },
          {
            question: 'Почему профилактика снижает расходы на электричество?',
            answer: 'Грязный кондиционер может потреблять на 10-30% больше энергии. Чистая система работает эффективнее, тратит меньше времени на охлаждение и снижает ежемесячные счета.',
          },
        ],
      },
    },
    inverter: {
      bg: {
        homeLabel: 'Начало',
        blogLabel: 'Блог',
        breadcrumb: 'Инверторен срещу обикновен',
        headline: 'Инверторен срещу обикновен климатик – кой е по-добър избор?',
        title: 'Инверторен срещу обикновен климатик – кой да изберете? | Несебър Клима',
        description: 'Разлики между инверторен и on/off климатик: разход на ток, комфорт, шум и дълготрайност. Препоръки за избор според нуждите.',
      },
      en: {
        homeLabel: 'Home',
        blogLabel: 'Blog',
        breadcrumb: 'Inverter vs standard',
        headline: 'Inverter vs standard air conditioner: what is the difference?',
        title: 'Inverter vs standard air conditioner: which one should you choose? | NessebarClima',
        description: 'Differences between inverter and on/off air conditioners: energy use, comfort, noise and durability. Practical advice for choosing the right type.',
      },
      de: {
        homeLabel: 'Startseite',
        blogLabel: 'Blog',
        breadcrumb: 'Inverter oder Standard',
        headline: 'Inverter oder Standard-Klimaanlage: was ist der Unterschied?',
        title: 'Inverter oder Standard-Klimaanlage: welche sollten Sie wählen? | NessebarClima',
        description: 'Unterschiede zwischen Inverter- und On/Off-Klimaanlagen: Stromverbrauch, Komfort, Geräusch und Haltbarkeit. Praktische Auswahlhilfe.',
      },
      ru: {
        homeLabel: 'Главная',
        blogLabel: 'Блог',
        breadcrumb: 'Инверторный или обычный',
        headline: 'Инверторный или обычный кондиционер: в чем разница?',
        title: 'Инверторный или обычный кондиционер: что выбрать? | NessebarClima',
        description: 'Разница между инверторным и on/off кондиционером: расход энергии, комфорт, шум и долговечность. Практические рекомендации по выбору.',
      },
    },
  };

  return meta[article][normalizedLocale] || meta[article].bg;
}

async function getBlogIndex(req, res, next) {
  try {
    const localizedPosts = getBlogPostsForLocale(req.locale).map((post) => ({ ...post, url: localizePath(post.url, req.locale) }));
    const pageMeta = getBlogIndexMeta(req.locale);
    const seo = buildSeo({
      req,
      title: pageMeta.title,
      description: pageMeta.description,
      canonicalPath: localizePath('/blog', req.locale),
      jsonLd: mergeJsonLd(req, { breadcrumbs: [{ name: pageMeta.homeLabel, url: localizePath('/', req.locale) }, { name: pageMeta.blogLabel, url: localizePath('/blog', req.locale) }] }),
    });
    res.render(localizedViewName('blog-index', req.locale), { ...seo, posts: localizedPosts, extraStyles: ['blog-index.css'] });
  } catch (err) {
    next(err);
  }
}

async function getBlogFreon(req, res, next) {
  try {
    const meta = getBlogArticleMeta('freon', req.locale);
    const baseUrl = getBaseUrl(req);
    const breadcrumbs = [
      { name: meta.homeLabel, url: localizePath('/', req.locale) },
      { name: meta.blogLabel, url: localizePath('/blog', req.locale) },
      { name: meta.breadcrumb, url: localizePath('/blog/freon-ceni-2026', req.locale) },
    ];
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline,
      description: meta.description,
      url: baseUrl + localizePath('/blog/freon-ceni-2026', req.locale),
      datePublished: '2026-02-19',
      dateModified: '2026-02-19',
      publisher: {
        '@type': 'Organization',
        name: 'Несебър Клима',
        logo: { '@type': 'ImageObject', url: baseUrl + '/assets/logos/logonsclima.png' },
      },
    };
    const jsonLd = mergeJsonLd(req, { breadcrumbs, faq: meta.faq }).concat(articleJsonLd);
    const seo = buildSeo({
      req,
      title: meta.title,
      description: meta.description,
      canonicalPath: localizePath('/blog/freon-ceni-2026', req.locale),
      jsonLd,
    });
    res.render(localizedViewName('blog-freon', req.locale), { ...seo, extraStyles: ['blog.css'] });
  } catch (err) {
    next(err);
  }
}

async function getBlogMontaz(req, res, next) {
  try {
    const meta = getBlogArticleMeta('montaz', req.locale);
    const baseUrl = getBaseUrl(req);
    const breadcrumbs = [
      { name: meta.homeLabel, url: localizePath('/', req.locale) },
      { name: meta.blogLabel, url: localizePath('/blog', req.locale) },
      { name: meta.breadcrumb, url: localizePath('/blog/montaz-klimatitsi', req.locale) },
    ];
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline,
      description: meta.description,
      url: baseUrl + localizePath('/blog/montaz-klimatitsi', req.locale),
      datePublished: '2026-02-19',
      dateModified: '2026-02-19',
      publisher: {
        '@type': 'Organization',
        name: 'Несебър Клима',
        logo: { '@type': 'ImageObject', url: baseUrl + '/assets/logos/logonsclima.png' },
      },
    };
    const jsonLd = mergeJsonLd(req, { breadcrumbs }).concat(articleJsonLd);
    const seo = buildSeo({
      req,
      title: meta.title,
      description: meta.description,
      canonicalPath: localizePath('/blog/montaz-klimatitsi', req.locale),
      jsonLd,
    });
    res.render(localizedViewName('blog-montaz', req.locale), { ...seo, extraStyles: ['blog.css'] });
  } catch (err) {
    next(err);
  }
}

async function getBlogProfilaktika(req, res, next) {
  try {
    const meta = getBlogArticleMeta('profilaktika', req.locale);
    const baseUrl = getBaseUrl(req);
    const breadcrumbs = [
      { name: meta.homeLabel, url: localizePath('/', req.locale) },
      { name: meta.blogLabel, url: localizePath('/blog', req.locale) },
      { name: meta.breadcrumb, url: localizePath('/blog/profilaktika-klimatitsi', req.locale) },
    ];
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline,
      description: meta.description,
      url: baseUrl + localizePath('/blog/profilaktika-klimatitsi', req.locale),
      datePublished: '2026-02-19',
      dateModified: '2026-02-19',
      publisher: {
        '@type': 'Organization',
        name: 'Несебър Клима',
        logo: { '@type': 'ImageObject', url: baseUrl + '/assets/logos/logonsclima.png' },
      },
    };
    const jsonLd = mergeJsonLd(req, { breadcrumbs, faq: meta.faq }).concat(articleJsonLd);
    const seo = buildSeo({
      req,
      title: meta.title,
      description: meta.description,
      canonicalPath: localizePath('/blog/profilaktika-klimatitsi', req.locale),
      jsonLd,
    });
    res.render(localizedViewName('blog-profilaktika', req.locale), { ...seo, extraStyles: ['blog.css'] });
  } catch (err) {
    next(err);
  }
}

async function getBlogInverter(req, res, next) {
  try {
    const meta = getBlogArticleMeta('inverter', req.locale);
    const baseUrl = getBaseUrl(req);
    const breadcrumbs = [
      { name: meta.homeLabel, url: localizePath('/', req.locale) },
      { name: meta.blogLabel, url: localizePath('/blog', req.locale) },
      { name: meta.breadcrumb, url: localizePath('/blog/inverter-vs-obiknoven', req.locale) },
    ];
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.headline,
      description: meta.description,
      url: baseUrl + localizePath('/blog/inverter-vs-obiknoven', req.locale),
      datePublished: '2026-02-19',
      dateModified: '2026-02-19',
      publisher: {
        '@type': 'Organization',
        name: 'Несебър Клима',
        logo: { '@type': 'ImageObject', url: baseUrl + '/assets/logos/logonsclima.png' },
      },
    };
    const jsonLd = mergeJsonLd(req, { breadcrumbs }).concat(articleJsonLd);
    const seo = buildSeo({
      req,
      title: meta.title,
      description: meta.description,
      canonicalPath: localizePath('/blog/inverter-vs-obiknoven', req.locale),
      jsonLd,
    });
    res.render(localizedViewName('blog-inverter', req.locale), { ...seo, extraStyles: ['blog.css'] });
  } catch (err) {
    next(err);
  }
}

function getError(req, res, next) {
  try {
    const code = Math.min(599, Math.max(400, parseInt(req.query.code, 10) || 500));
    const message = (req.query.message && String(req.query.message).trim()) || (code === 404 ? 'Страницата не е намерена.' : 'Възникна грешка. Моля, опитайте отново по-късно.');
    res.status(code).render(localizedViewName('error', req.locale), {
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
  BLOG_POSTS,
  getBlogPostsForLocale,
  getAbout,
  getUslugi,
  getBlogIndex,
  getBlogFreon,
  getBlogMontaz,
  getBlogProfilaktika,
  getBlogInverter,
  getError,
};