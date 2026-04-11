const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/', async (req, res) => {
    const { name, email, phone, checkIn, checkOut, roomType, guests, specialRequests } = req.body;
    
    if (!name || !email || !phone || !checkIn || !checkOut || !roomType || !guests) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const newBooking = await Booking.create({
            name, email, phone, checkIn, checkOut, roomType, guests, specialRequests
        });
        
        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: newBooking._id
        });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Get all bookings (for admin or testing)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json(bookings.map(b => b.toJSON()));
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

module.exports = router;
