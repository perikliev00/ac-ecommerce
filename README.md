# NesebarClima

**E-commerce and info site for an air-conditioning shop in Nesebar (Несебър), Bulgaria.**  
Node.js, Express, EJS, MongoDB — product catalog, cart, checkout, admin panel, and SEO.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://mongoosejs.com/)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Scripts](#scripts)
- [Database models](#database-models)
- [License](#license)

---

## Features

- **Product catalog** — Inverter, hyperinverter, and floor AC units from the database with filters and product detail pages
- **Shopping cart & checkout** — Session-based cart, checkout form, and order storage
- **Contact form** — Contact requests saved and manageable in the admin panel
- **Admin panel** — Login-protected dashboard to manage products, orders, contact requests, and reviews
- **Reviews** — Admin-managed customer reviews (add, edit, delete)
- **SEO** — Meta tags, JSON-LD, dynamic `sitemap.xml` and `robots.txt`
- **Product images** — Upload via Multer; optional processing with Sharp; product badges from data

---

## Tech stack

| Layer       | Technology              |
|------------|-------------------------|
| Runtime    | Node.js ≥ 18            |
| Server     | Express 4.x             |
| Templates  | EJS                     |
| Database   | MongoDB (Mongoose)      |
| Auth       | express-session, bcrypt |
| Config     | dotenv                  |
| File upload| Multer                  |
| Images     | Sharp (optional)        |

---

## Getting started

### Prerequisites

- **Node.js** 18 or higher  
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Install and run

```bash
# Clone the repo
git clone https://github.com/your-username/nesebar-clima.git
cd nesebar-clima

# Install dependencies
npm install

# Configure environment (see Configuration below)
cp .env.example .env
# Edit .env and set MONGO_URI, SESSION_SECRET, and optionally ADMIN_USERNAME / ADMIN_PASSWORD

# Start the app
npm start
```

Open **http://localhost:3000**.  
On first run, if `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set in `.env`, an admin user is created when none exists.

---

## Configuration

All environment variables are read from a **`.env`** file (see **`.env.example`** for a template). Do not commit `.env`; it is listed in `.gitignore`.

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `SESSION_SECRET` | Secret for signing admin session cookies | Yes (use a long random string in production) |
| `PORT` | Server port | No (default: `3000`) |
| `SESSION_COOKIE_NAME` | Session cookie name | No (default: `nesebar.admin.sid`) |
| `DEFAULT_HOST` | Fallback host for sitemap/robots when `Host` header is missing | No (default: `localhost:3000`) |
| `ADMIN_USERNAME` | Username for the admin user created on first run | No (if unset, no admin is auto-created) |
| `ADMIN_PASSWORD` | Password for that admin user | No |

**Production:** set a strong `SESSION_SECRET` and change `ADMIN_PASSWORD`. Do not rely on default or example values.

---

## Project structure

```
nesebar-clima/
├── app.js                 # Entry point: Express app, middleware, route registration, MongoDB connect
├── package.json
├── .env.example           # Template for environment variables (safe to commit)
├── .env                   # Your local config (do not commit)
├── routes/                # Route definitions (no business logic)
│   ├── index.js           # Registers all route modules
│   ├── admin.js           # /admin/* (auth, dashboard, orders, contacts, reviews, products)
│   ├── cart.js            # /cart, /checkout, /order-success, /api/cart
│   ├── products.js        # /, /produkti, /inverter, /hyperinverter, /floor, /product/:id
│   ├── pages.js           # /about, /kontakti, /uslugi, /error
│   └── misc.js            # favicon, /robots.txt, /sitemap.xml
├── controllers/            # Request handlers (business logic)
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── contactController.js
│   ├── productController.js
│   ├── pagesController.js  # about, uslugi, error
│   └── miscController.js   # favicon, robots, sitemap
├── lib/
│   ├── config.js          # Loads .env and exposes config (PORT, MONGO_URI, etc.)
│   ├── auth.js            # requireAdmin middleware
│   ├── db.js               # DB helpers
│   ├── errorHandler.js    # asyncHandler, 404, global error handler
│   ├── productImageSlug.js
│   ├── seo.js              # buildSeo, JSON-LD, OG image
│   └── upload.js           # Multer config for product images
├── models/
│   ├── ContactRequest.js
│   ├── Order.js
│   ├── Product.js
│   ├── Review.js
│   └── User.js
├── public/                 # Static assets (CSS, JS, images, logos)
├── scripts/
│   ├── seed-admin.js       # Create admin user (uses .env)
│   ├── seed-products-from-pages.js
│   ├── generate-product-images.js
│   ├── generate-missing-product-images.js
│   ├── seed-midea-product.js
│   └── update-product-image-filenames.js
└── views/                  # EJS templates
    ├── partials/          # head, header, footer, catalog, product-cards, cart-drawer, etc.
    ├── admin*.ejs
    ├── index.ejs, about.ejs, kontakti.ejs, uslugi.ejs
    ├── produkti.ejs, product.ejs, inverter.ejs, hyperinverter.ejs, floor.ejs
    ├── checkout.ejs, order-success.ejs, error.ejs
    └── ...
```

---

## Routes

### Public

| Path | Description |
|------|-------------|
| `/` | Home (featured + recommended products) |
| `/about` | За нас (About) |
| `/kontakti` | Контакти (Contact form) |
| `/uslugi` | Услуги (Services) |
| `/produkti` | Full product catalog |
| `/inverter`, `/hyperinverter`, `/floor` | Category catalog pages |
| `/product/:id` | Product detail |
| `/cart` | Cart page |
| `/checkout` | Checkout form |
| `/order-success` | Order confirmation |
| `/error` | Error page (`?code=&message=`) |

### Cart API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cart` | Cart as JSON |
| POST | `/cart/add` | Add item |
| POST | `/cart/remove` | Remove item |

### Admin (protected)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/login` | Login form |
| POST | `/admin/login` | Login |
| POST | `/admin/logout` | Logout |
| GET | `/admin` | Dashboard |
| GET | `/admin/orders` | Orders (mark ready, delete) |
| GET | `/admin/contacts` | Contact requests (mark ready, delete) |
| GET | `/admin/reviews` | Reviews list |
| GET | `/admin/reviews/new` | New review form |
| GET | `/admin/reviews/:id/edit` | Edit review |
| POST | `/admin/reviews` | Create review |
| POST | `/admin/reviews/:id` | Update review |
| POST | `/admin/reviews/:id/delete` | Delete review |
| GET | `/admin/products/:id/edit` | Edit product |
| POST | `/admin/products` | Add product (with image upload) |
| POST | `/admin/products/:id` | Update product (optional image) |
| POST | `/admin/products/:id/delete` | Delete product |

### Other

| Path | Description |
|------|-------------|
| `/robots.txt` | Dynamic (disallows /admin, /cart, etc.; Sitemap URL) |
| `/sitemap.xml` | Dynamic sitemap (static pages + product URLs from DB) |
| `/favicon.ico`, etc. | Favicon routes → logo |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the app |
| `npm run dev` | Same as start |
| `npm run seed` | Seed products from pages script |
| `npm run generate-images` | Generate product images (Sharp) |
| `npm run update-image-filenames` | Update product image filenames |

**Create admin user only:**

```bash
node scripts/seed-admin.js
```

Requires `.env` with `MONGO_URI`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.

---

## Database models

- **Product** — category (inverter / hyperinverter / floor), price, description, brand, model, image, filters (class, availability, energyClass, wifi, roomSize), `recommended` for homepage, `currentOffer` for badge/ribbon.
- **Order** — customer (fullName, phone, address, comment), items (productId, title, price, quantity, img), total, ready flag.
- **User** — username, hashed password (admin login).
- **ContactRequest** — name, email, phone, subject, ready flag.
- **Review** — name, rating, text, order (for sorting).

Product **ribbons** (badges on cards) come from `Product.currentOffer` (e.g. “+ ВКЛЮЧЕН МОНТАЖ”). `Product.toCard()` builds a `ribbons` array of `{ style, label }`.

---

## License

Proprietary / private project. All rights reserved.
