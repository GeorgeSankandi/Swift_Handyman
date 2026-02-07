const express = require('express');
const router = express.Router();
const passport = require('passport');
const Service = require('../models/Service');
const User = require('../models/User');
const { preventCaching } = require('../middleware/auth'); // <-- Import middleware

// Login Page
router.get('/login', (req, res) => res.render('login', {
    layout: 'main',
    page: 'login'
}));

// Register Page
router.get('/register', (req, res) => res.render('register', {
    layout: 'main',
    page: 'register'
}));

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, password2, role } = req.body;
  let errors = [];

  // --- 1. Validation Checks ---
  if (!name || !email || !password || !password2 || !role) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.render('register', { errors, name, email, role });
  }

  // --- 2. User Creation Logic with Error Handling ---
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      errors.push({ msg: 'An account with that email already exists' });
      return res.render('register', { errors, name, email, role });
    }
    
    // Create new user instance. The password will be hashed by the middleware in User.js.
    const newUser = new User({ name, email, password, role });
    
    // Save the user to the database
    await newUser.save();
    
    req.flash('success_msg', 'You have successfully registered and can now log in');
    res.redirect('/login');

  } catch (err) {
    // This will catch any errors from the database save operation or the hashing middleware
    console.error('Error during registration:', err);
    req.flash('error_msg', 'Something went wrong on our end. Please try registering again.');
    res.redirect('/register');
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// --- THIS IS THE FIX ---
// Logout
router.get('/logout', preventCaching, (req, res, next) => {
  // For passport version < 0.6.0, logout() is synchronous and does not take a callback.
  req.logout();
  
  // To ensure a clean logout, we destroy the entire session.
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error during logout:', err);
      return next(err);
    }
    // Instruct the browser to clear the session cookie for added security.
    res.clearCookie('connect.sid');
    
    // Redirect to the login page. Flash messages won't work here as the session is gone.
    res.redirect('/login');
  });
});


// Home Page
router.get('/', async (req, res) => {
    try {
        const services = await Service.find()
            .populate('provider')
            .sort({ createdAt: 'desc' })
            .limit(3)
            .lean();
        res.render('index', { 
            services,
            page: 'home'
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

module.exports = router;