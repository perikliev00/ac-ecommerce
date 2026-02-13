const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const config = require('./lib/config');
const { getAssetUrl, DEFAULT_OG_IMAGE } = require('./lib/seo');
const { notFoundHandler, globalErrorHandler } = require('./lib/errorHandler');
const { registerRoutes } = require('./routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: config.SESSION_COOKIE_NAME,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    sameSite: 'lax',
  },
}));

app.use((req, res, next) => {
  res.locals.defaultOgImage = getAssetUrl(req, DEFAULT_OG_IMAGE);
  next();
});

registerRoutes(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(config.PORT, () => {
  console.log(`NesebarClima at http://localhost:${config.PORT}`);
  mongoose.connect(config.MONGO_URI)
    .then(async () => {
      console.log('✅ MongoDB connected');
      const User = require('./models/User');
      const Review = require('./models/Review');
      if (config.ADMIN_USERNAME && config.ADMIN_PASSWORD) {
        const existing = await User.findOne({ username: config.ADMIN_USERNAME.toLowerCase() });
        if (!existing) {
          const u = new User({ username: config.ADMIN_USERNAME, password: config.ADMIN_PASSWORD });
          await u.save();
          console.log('✅ Admin user created (' + config.ADMIN_USERNAME + ')');
        }
      }
      const reviewCount = await Review.countDocuments();
    })
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
});
