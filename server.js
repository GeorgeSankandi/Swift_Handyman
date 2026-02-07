const express = require('express');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const SiteContent = require('./models/SiteContent');

// Define Core Services Data
const coreServices = [
    {
        slug: 'plumbing',
        title: 'Plumbing Services',
        short_description: 'From leaky faucets to full pipe installations, our plumbing experts have you covered.',
        full_description: 'Our certified plumbing professionals handle a wide range of issues, including emergency leak repairs, drain cleaning, water heater installation and repair, fixture replacement, and complete piping for new constructions or renovations. We ensure all work is up to code and completed with the highest quality materials for long-lasting results.',
        icon_svg: `<svg fill="currentColor" viewBox="0 0 50 50" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" overflow="inherit" width="64" height="64" class="mb-3" style="color: var(--namibian-blue);"><path d="M45.971 44.396c0-1.994-3.638-7.567-3.638-7.567s-3.693 5.573-3.693 7.567c0 1.99 1.642 3.604 3.666 3.604 2.023 0 3.665-1.614 3.665-3.604zm-26.305-31.225h-7.331v-7.227h1.999v-3.944h-13.334v3.944h2v11.17c0 2.904 2.388 5.257 5.333 5.257h11.333v1.972h4.001v-13.142h-4.001v1.97zm27.332 16.428v-11.17c0-2.903-2.387-5.257-5.329-5.257h-11.335v-1.97h-4.001v13.143h4.001v-1.973h7.332v7.227h-1.997v3.944h13.331v-3.944h-2.002z"></path></svg>`
    },
    {
        slug: 'electrical',
        title: 'Electrical Services',
        short_description: 'Safe and certified electrical services, including wiring, fixtures, and repairs.',
        full_description: 'Our licensed electricians are equipped to handle all your electrical needs. This includes new wiring for homes and businesses, circuit breaker panel upgrades, installing light fixtures and ceiling fans, troubleshooting and fixing power outages, and ensuring your property is compliant with all safety standards. Your safety is our top priority.',
        icon_svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-lightbulb mb-3" viewBox="0 0 16 16" style="color: var(--namibian-blue);"><path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A6 6 0 0 1 2 6zm6 8.5a.5.5 0 0 0 .5-.5h-1a.5.5 0 0 0 .5.5zM8 1a5 5 0 0 0-5 5c0 1.938 1.12 3.6 2.794 4.414A1 1 0 0 1 7 11.5h2c.247 0 .474-.102.646-.286A5.001 5.001 0 0 0 13 6a5 5 0 0 0-5-5z"></svg>`
    },
    {
        slug: 'mechanical',
        title: 'Mechanical Services',
        short_description: 'General mechanical repairs, assembly, and maintenance for various equipment.',
        full_description: 'We offer a variety of mechanical services, including small engine repair, equipment assembly, preventative maintenance for machinery, and general mechanical troubleshooting. Our technicians can help keep your essential equipment running smoothly, minimizing downtime and saving you money on costly replacements.',
        icon_svg: `<svg fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 418.879 418.879" xml:space="preserve" width="64" height="64" class="mb-3" style="color: var(--namibian-blue);"><g><g><path d="M188.634,234.066c8.462-5.287,16.126-11.735,22.767-19.127l23.942,13.826l21.8-37.76l-23.894-13.796 c3.038-9.275,4.825-19.113,5.16-29.311l27.183-4.793l-7.574-42.938l-27.178,4.793c-3.756-9.309-8.795-17.965-14.906-25.744 l17.766-21.17L200.3,30.022l-17.751,21.152c-8.67-4.646-18.059-8.119-27.954-10.203V13.385h-43.6v27.586 c-9.896,2.084-19.285,5.557-27.956,10.203l-17.75-21.152l-33.4,28.025l17.764,21.17c-6.11,7.779-11.149,16.436-14.905,25.744 L7.57,100.168L0,143.106l27.179,4.793c0.335,10.199,2.123,20.035,5.161,29.313L8.444,191.007l21.801,37.759l23.943-13.822 c6.639,7.389,14.303,13.838,22.766,19.125l-9.451,25.963l40.972,14.91l9.438-25.928c4.864,0.688,9.831,1.053,14.882,1.053 c5.051,0,10.019-0.363,14.883-1.053l9.437,25.93l40.97-14.914L188.634,234.066z M132.793,200.065 c-30.702,0-55.68-24.977-55.68-55.68c0-30.701,24.978-55.68,55.68-55.68s55.68,24.979,55.68,55.68 C188.473,175.088,163.496,200.065,132.793,200.065z"></path><path d="M376.041,266.807l-18.795,6.08c-3.584-6.229-8.014-11.869-13.115-16.779l10.504-16.764l-26.447-16.57l-10.498,16.75 c-6.604-2.438-13.602-3.973-20.826-4.471l-2.725-19.559l-30.912,4.309l2.725,19.559c-6.809,2.453-13.125,5.847-18.812,9.996 l-14.672-13.244l-20.912,23.168l14.684,13.259c-3.562,6.118-6.277,12.752-8.02,19.726l-19.744-0.714l-1.129,31.188l19.743,0.716 c1.246,7.198,3.486,13.991,6.558,20.271l-15.578,12.143l19.185,24.615l15.609-12.164c5.438,4.582,11.511,8.396,18.031,11.311 l-4.138,19.344l30.522,6.52l4.133-19.314c3.516,0.01,7.072-0.229,10.652-0.727c3.582-0.498,7.07-1.25,10.447-2.215l9.256,17.451 l27.574-14.623l-9.266-17.471c5.48-4.586,10.271-9.918,14.252-15.812l18.338,7.436l11.727-28.924l-18.303-7.422 c1.234-6.875,1.529-14.027,0.764-21.293l18.799-6.084L376.041,266.807z M297.129,350.006 c-21.771,3.031-41.949-12.209-44.98-33.977c-3.037-21.769,12.207-41.949,33.977-44.979c21.768-3.036,41.941,12.207,44.98,33.978 C334.135,326.795,318.896,346.969,297.129,350.006z"></path><path d="M418.146,158.647l0.732-24.629l-15.586-0.463c-0.977-5.428-2.723-10.803-5.285-15.971l12.24-9.67l-15.271-19.33 l-12.238,9.666c-4.365-3.627-9.193-6.584-14.318-8.816l3.164-15.291l-24.123-4.996l-3.17,15.281 c-5.559,0.008-11.156,0.797-16.641,2.412l-7.391-13.727l-21.695,11.684l7.391,13.729c-4.363,3.686-8.107,7.934-11.176,12.566 l-14.496-5.77l-9.111,22.893l14.508,5.779c-0.955,5.508-1.141,11.158-0.514,16.799l-14.809,4.898l7.732,23.395l14.809-4.896 c2.9,4.986,6.426,9.396,10.426,13.201l-8.191,13.268l20.963,12.946l8.209-13.292c5.285,1.896,10.828,3.051,16.453,3.414 l2.252,15.453l24.383-3.561l-2.246-15.434c2.602-0.957,5.17-2.109,7.684-3.463c2.516-1.352,4.891-2.867,7.123-4.51l11.648,10.371 l16.387-18.398l-11.656-10.383c2.795-4.9,4.875-10.164,6.203-15.619L418.146,158.647z M359.436,171.844 c-15.281,8.227-34.404,2.492-42.627-12.783c-8.23-15.277-2.494-34.404,12.787-42.627c15.273-8.229,34.395-2.49,42.625,12.787 C380.443,144.499,374.711,163.616,359.436,171.844z"></path></g></g></svg>`
    },
    {
        slug: 'general',
        title: 'General Maintenance',
        short_description: 'All-around handyman services for odd jobs, maintenance, and small home projects.',
        full_description: 'For all the small jobs around the house or office that you can\'t get to, our general maintenance service is the perfect solution. This includes tasks like picture hanging, furniture assembly, minor drywall patching, painting touch-ups, and other "odd jobs". No job is too small for our professional and efficient team.',
        icon_svg: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-house-gear mb-3" viewBox="0 0 16 16" style="color: var(--namibian-blue);"><path d="M7.293 1.5a1 1 0 0 1 1.414 0L11 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1-.708.708L8 2.207l-5.646 5.647a.5.5 0 0 1-.708-.708L7.293 1.5Z"/><path d="M11.07 9.047a1.5 1.5 0 0 0-1.742.26l-.02.021a1.5 1.5 0 0 0-.26 1.742l.021.02a1.5 1.5 0 0 0 1.742-.26l.02-.021a1.5 1.5 0 0 0 .26-1.742l-.021-.02Zm-2.435.305a.5.5 0 0 1 .707 0l.02.02a.5.5 0 0 1 0 .708l-.02.02a.5.5 0 0 1-.707 0l-.02-.02a.5.5 0 0 1 0-.707l.02-.02ZM12 8.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 12 8.25Z"/><path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-3.5-2a.5.5 0 0 0-1 0V11h-1.5a.5.5 0 0 0 0 1H11v1.5a.5.5 0 0 0 1 0V12h1.5a.5.5 0 0 0 0-1H12v-1.5Z"/><path d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5Z"/></svg>`
    }
];

// Load config
dotenv.config({ path: './.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override (Updated to use query string for multipart form support)
app.use(methodOverride('_method'));

// Handlebars Helpers
const { formatDate, select, truncate } = require('./helpers/hbs');

// Handlebars Engine Configuration
const hbs = exphbs.create({
    helpers: { 
        formatDate, 
        select, 
        truncate,
        ifeq: function(a, b, options) {
            return a == b;
        },
        lookup: function(obj, key) {
            return obj[key];
        },
        concat: function(...args) {
            return args.slice(0, -1).join('');
        }
    },
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'views/partials')
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Sessions
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swift-handyman' }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Middleware to load site content and core services into res.locals
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const contentDocs = await SiteContent.find().lean();
            const siteContent = contentDocs.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {});
            
            const defaults = {
                home_hero_title: 'Find Trusted Tradespeople, Fast.',
                home_hero_subtitle: 'The modern, reliable way to book verified technical and mechanical services across Namibia.',
                home_hero_image: '/images/default-hero.jpg',
                about_hero_title: 'About Swift Handyman',
                about_hero_subtitle: 'Your trusted partner for professional technical and mechanical services in Namibia.',
                about_hero_image: '/images/default-hero.jpg',
            };
            res.locals.siteContent = { ...defaults, ...siteContent };
            res.locals.coreServices = coreServices;
        }
        next();
    } catch (error) {
        console.error("Site Content Load Error:", error);
        res.locals.siteContent = {}; 
        res.locals.coreServices = []; 
        next();
    }
});

// Global variables for flash messages and user
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.now = new Date();
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/pages'));
app.use('/services', require('./routes/services'));
app.use('/articles', require('./routes/articles'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/bookings', require('./routes/bookings'));
app.use('/api', require('./routes/api'));
app.use('/provider', require('./routes/provider'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));