const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { ensureAuthenticated, ensureProvider, ensureAdmin } = require('../middleware/auth');
const Service = require('../models/Service');

// @desc    Show all services
// @route   GET /services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().populate('provider').sort({ createdAt: 'desc' }).lean();
        res.render('services/index', { 
            services,
            page: 'services' 
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// @desc    Show add page
// @route   GET /services/add
router.get('/add', ensureProvider, (req, res) => {
    res.render('services/add');
});

// @desc    Process add form
// @route   POST /services
router.post('/', ensureProvider, upload, async (req, res) => {
    try {
        req.body.provider = req.user.id;
        if (req.file) {
            req.body.imageUrl = '/uploads/' + req.file.filename;
        }
        await Service.create(req.body);
        req.flash('success_msg', 'Service Created Successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// START: DELETE ALL ROUTE
// @desc    Delete All services (Admin Only)
// @route   DELETE /services/delete-all
router.delete('/delete-all', ensureAdmin, async (req, res) => {
  try {
    await Service.deleteMany({});
    req.flash('success_msg', 'All services have been successfully deleted.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});
// END: DELETE ALL ROUTE

// @desc    Show single service (Updated with Related Services)
// @route   GET /services/:id
router.get('/:id', async (req, res) => {
    try {
        // 1. Fetch the main service
        let service = await Service.findById(req.params.id).populate('provider').lean();
        
        if (!service) {
            return res.render('error/404');
        }

        // 2. Fetch related services in the same category (excluding the current one)
        const relatedServices = await Service.find({ 
            category: service.category,
            _id: { $ne: service._id } // Exclude current service ID
        })
        .populate('provider')
        .limit(3) // Limit to 3 items for a clean layout
        .lean();

        res.render('services/show', { 
            service, 
            relatedServices 
        });

    } catch (err) {
        console.error(err);
        res.render('error/404');
    }
});


// @desc    Show edit page
// @route   GET /services/edit/:id
router.get('/edit/:id', ensureProvider, async (req, res) => {
    try {
        const service = await Service.findOne({ _id: req.params.id }).lean();
        if (!service) {
            return res.render('error/404');
        }
        
        if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            req.flash('error_msg', 'Not Authorized');
            return res.redirect('/services');
        }
        
        res.render('services/edit', { service });
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});

// @desc    Update service
// @route   PUT /services/:id
router.put('/:id', ensureProvider, upload, async (req, res) => {
    try {
        let service = await Service.findById(req.params.id).lean();
        if (!service) {
            return res.render('error/404');
        }

        if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            req.flash('error_msg', 'Not Authorized');
            return res.redirect('/services');
        }
        
        if (!req.body.onSale) {
            req.body.onSale = false;
        } else {
            req.body.onSale = true;
        }

        const updateData = req.body;
        if (req.file) {
            updateData.imageUrl = '/uploads/' + req.file.filename;
        }

        await Service.findOneAndUpdate({ _id: req.params.id }, updateData, {
            new: true,
            runValidators: true,
        });
        
        req.flash('success_msg', 'Service Updated Successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});

// @desc    Delete service
// @route   DELETE /services/:id
router.delete('/:id', ensureProvider, async (req, res) => {
    try {
        let service = await Service.findById(req.params.id).lean();
        if (!service) {
            return res.render('error/404');
        }

        if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            req.flash('error_msg', 'Not Authorized');
            return res.redirect('/services');
        }

        await Service.deleteOne({ _id: req.params.id });
        req.flash('success_msg', 'Service Removed Successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        return res.render('error/500');
    }
});

module.exports = router;