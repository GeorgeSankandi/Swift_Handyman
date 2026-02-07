const express = require('express');
const router = express.Router();
const { ensureAuthenticated, preventCaching } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create new booking
// @route   POST /bookings
router.post('/', ensureAuthenticated, preventCaching, async (req, res) => {
  try {
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      req.flash('error_msg', 'Service not found.');
      return res.redirect('/services');
    }

    const newBooking = {
      service: req.body.serviceId,
      client: req.user.id,
      provider: service.provider,
      bookingDate: req.body.bookingDate,
      status: 'Pending',
    };

    await Booking.create(newBooking);
    req.flash('success_msg', 'Booking request sent successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// @desc    Update booking status (for providers/admins)
// @route   POST /bookings/status/:id
router.post('/status/:id', ensureAuthenticated, preventCaching, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if(!booking) {
            req.flash('error_msg', 'Booking not found');
            return res.redirect('/dashboard');
        }
        // Authorization: only the provider of the service or an admin can update
        if(booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/dashboard');
        }
        
        booking.status = req.body.status;
        await booking.save();
        req.flash('success_msg', 'Booking status updated');
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});


module.exports = router;