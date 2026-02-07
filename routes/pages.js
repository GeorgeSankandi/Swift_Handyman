const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const Service = require('../models/Service'); // <--- Added Service Model Import

// @desc    Show About Us page
// @route   GET /about
router.get('/about', async (req, res) => {
    try {
        const contentDocs = await SiteContent.find().lean();
        const siteContent = contentDocs.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});

        res.render('about', {
            page: 'about',
            siteContent
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// @desc    Show Contact Us page
// @route   GET /contact
router.get('/contact', (req, res) => {
    res.render('contact', {
        page: 'contact'
    });
});

// @desc    Show individual team member page
// @route   GET /team/:id
router.get('/team/:id', async (req, res) => {
  try {
    const contentDocs = await SiteContent.find().lean();
    const siteContent = contentDocs.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const memberId = req.params.id;
    const member = {
      name: siteContent[`about_team_${memberId}_name`],
      title: siteContent[`about_team_${memberId}_title`],
      image: siteContent[`about_team_${memberId}_image`],
      bio: siteContent[`about_team_${memberId}_bio`] || 'Detailed biography coming soon. Please check back later for more information about this team member.'
    };

    if (!member.name) {
        return res.render('error/404');
    }

    res.render('team_member', {
      page: 'about', 
      member,
      siteContent 
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// @desc    Show individual core service page and list relevant DB services
// @route   GET /core-service/:slug
router.get('/core-service/:slug', async (req, res) => {
    try {
        // 1. Get Core Service Info
        const coreServices = res.locals.coreServices || [];
        const serviceInfo = coreServices.find(s => s.slug === req.params.slug);

        if (!serviceInfo) {
            return res.render('error/404');
        }

        // 2. Map Slug to DB Category (Capitalize first letter to match Enum)
        // slugs are: 'plumbing', 'electrical', 'mechanical', 'general'
        // DB categories: 'Plumbing', 'Electrical', 'Mechanical', 'General'
        const categoryMap = {
            'plumbing': 'Plumbing',
            'electrical': 'Electrical',
            'mechanical': 'Mechanical',
            'general': 'General'
        };

        const dbCategory = categoryMap[req.params.slug];

        // 3. Fetch actual services from MongoDB for this category
        const services = await Service.find({ category: dbCategory })
            .populate('provider')
            .sort({ createdAt: 'desc' })
            .lean();

        // 4. Prepare Page Data
        const pageData = {
            hero_title: serviceInfo.title,
            hero_subtitle: serviceInfo.short_description,
            hero_image: res.locals.siteContent.services_hero_image || '/images/default-hero.jpg' 
        };

        res.render('core_service', {
            pageData,
            service: serviceInfo, // Static info (description, icon)
            services,             // Actual DB listings
            page: 'services'
        });

    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

module.exports = router;