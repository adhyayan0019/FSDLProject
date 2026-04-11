const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authMiddleware } = require('./auth');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
};

router.use(authMiddleware);
router.use(adminMiddleware);

// Get all bookings with filtering
router.get('/bookings', async (req, res) => {
    const { date, roomType, search } = req.query;
    
    let query = {};

    if (date) {
        query.checkIn = { $lte: date };
        query.checkOut = { $gt: date };
    }
    if (roomType) {
        query.roomType = roomType;
    }
    if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
        ];
    }

    try {
        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        res.status(200).json(bookings.map(b => b.toJSON()));
    } catch (err) {
        console.error('Error fetching bookings:', err.message);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Update booking status and send SMS
router.post('/bookings/:id/confirm', async (req, res) => {
    const { id } = req.params;
    
    try {
        const booking = await Booking.findByIdAndUpdate(id, { status: 'confirmed' }, { new: true });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        try {
            const message = `Hello ${booking.name}, your booking is confirmed! 🎉`;
            const twilioPhoneNumber = booking.phone.startsWith('+') ? booking.phone : '+91' + booking.phone;
            
            await client.messages.create({
                body: message,
                messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
                to: twilioPhoneNumber
            });
            console.log(`Twilio SMS sent successfully to ${twilioPhoneNumber}`);
        } catch (smsErr) {
            console.error('Failed to send SMS via Twilio', smsErr.message);
        }

        res.status(200).json({ message: 'Booking confirmed and Twilio SMS triggered' });
    } catch (err) {
        console.error('Error confirming booking', err);
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});

// Get metrics
router.get('/metrics', async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

        res.json({
            totalBookings,
            pendingBookings,
            confirmedBookings
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to aggregate metrics' });
    }
});

module.exports = router;
