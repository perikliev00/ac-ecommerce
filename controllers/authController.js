const User = require('../models/User');

/**
 * GET /admin/login – show login form. Redirect to /admin if already logged in.
 */
async function getLogin(req, res, next) {
  try {
    if (req.session && req.session.adminUserId) {
      return res.redirect('/admin');
    }
    res.render('admin-login', {
      error: req.query.error || null,
      returnTo: req.query.returnTo || '/admin',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/login – authenticate; set session and redirect or show error.
 */
async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const returnTo = (req.body.returnTo || '/admin').replace(/^[^/]|\.\./g, '') || '/admin';
    const safeReturn = returnTo.startsWith('/admin') ? returnTo : '/admin';

    if (!username || !password) {
      return res.render('admin-login', {
        error: 'Invalid username or password.',
        returnTo: safeReturn,
      });
    }

    const result = await User.authenticate(username, password);

    if (!result.success) {
      return res.render('admin-login', {
        error: 'Invalid username or password.',
        returnTo: safeReturn,
      });
    }

    req.session.adminUserId = result.user._id.toString();
    req.session.adminUsername = result.user.username;
    return res.redirect(safeReturn);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/logout – destroy session and redirect to login.
 */
function postLogout(req, res, next) {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.redirect('/admin/login');
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
};
