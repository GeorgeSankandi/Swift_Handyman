const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin, preventCaching } = require('../middleware/auth');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const User = require('../models/User');
const SiteContent = require('../models/SiteContent');
const Article = require('../models/Article'); // <-- Import Article model
const { uploadSiteContent } = require('../middleware/upload');

// @desc    Dashboard
// @route   GET /dashboard
router.get('/', ensureAuthenticated, preventCaching, async (req, res) => {
    try {
        if (req.user.role === 'client') {
            const bookings = await Booking.find({ client: req.user.id })
                .populate('service')
                .populate('provider')
                .lean();
            res.render('dashboard/client', { user: req.user, bookings });
        } else if (req.user.role === 'provider') {
            const services = await Service.find({ provider: req.user.id }).lean();
            const bookings = await Booking.find({ provider: req.user.id })
                .populate('service')
                .populate('client')
                .lean();
            res.render('dashboard/provider', { user: req.user, services, bookings });
        } else if (req.user.role === 'admin') {
            const services = await Service.find().populate('provider').lean();
            const bookings = await Booking.find().populate('client').populate('provider').populate('service').lean();
            const providers = await User.find({ role: 'provider' }).lean();
            const contentDocs = await SiteContent.find().lean();
            const articles = await Article.find().sort({ createdAt: 'desc' }).lean(); // <-- Fetch articles

            // Convert array of content documents to a key-value object
            const siteContent = contentDocs.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {});

            res.render('dashboard/admin', {
                user: req.user,
                services,
                bookings,
                providers,
                siteContent,
                articles // <-- Pass articles to the view
            });
        }
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


// @desc    Update Site Content
// @route   POST /dashboard/site-content
router.post('/site-content', ensureAdmin, preventCaching, uploadSiteContent, async (req, res) => {
    try {
        const textContent = req.body;
        const imageContent = req.files;

        const operations = [];

        // Prepare bulk write operations for text content
        for (const key in textContent) {
            operations.push({
                updateOne: {
                    filter: { key: key },
                    update: { $set: { value: textContent[key] } },
                    upsert: true
                }
            });
        }

        // Prepare bulk write operations for uploaded images
        for (const key in imageContent) {
            const imageUrl = '/uploads/' + imageContent[key][0].filename;
            operations.push({
                updateOne: {
                    filter: { key: key },
                    update: { $set: { value: imageUrl } },
                    upsert: true
                }
            });
        }

        if (operations.length > 0) {
            await SiteContent.bulkWrite(operations);
        }

        req.flash('success_msg', 'Site content updated successfully');
        res.redirect('/dashboard');

    } catch (err) {
        console.error("Error updating site content:", err);
        req.flash('error_msg', 'Failed to update site content.');
        res.redirect('/dashboard');
    }
});


module.exports = router;