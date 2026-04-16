const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const RoomInventory = require('../models/RoomInventory');

// Get availability for a room type and month
router.get('/availability', async (req, res) => {
    const { roomType, month, year } = req.query;
    if (!roomType || !month || !year) return res.status(400).json({ error: 'Missing parameters' });
    
    try {
        const inventory = await RoomInventory.findOne({ roomType });
        // Default to 5 if not configured so calendar shows available
        const totalCapacity = inventory ? inventory.totalCapacity : 5;
        const dateCapacities = inventory && inventory.dateCapacities ? Object.fromEntries(inventory.dateCapacities) : {};
        
        // Find existing bookings that overlap with this month
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`; 
        
        const bookings = await Booking.find({
            roomType,
            status: { $ne: 'cancelled' },
            checkIn: { $lte: endDate },
            checkOut: { $gte: startDate }
        });
        
        // Calculate daily usage
        const dailyUsage = {};
        bookings.forEach(b => {
             let d = new Date(b.checkIn);
             let out = new Date(b.checkOut);
             for (let curr = new Date(d); curr < out; curr.setDate(curr.getDate() + 1)) {
                 const dateStr = curr.toISOString().split('T')[0];
                 dailyUsage[dateStr] = (dailyUsage[dateStr] || 0) + 1;
             }
        });
        
        // Calculate daily max capacity
        const dailyMax = {};
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dailyMax[dateStr] = dateCapacities[dateStr] !== undefined ? dateCapacities[dateStr] : totalCapacity;
        }
        
        res.json({ totalCapacity, dailyUsage, dailyMax });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching availability' });
    }
});

// Create a new booking
router.post('/', async (req, res) => {
    const { name, email, phone, checkIn, checkOut, roomType, guests, specialRequests } = req.body;
    
    if (!name || !email || !phone || !checkIn || !checkOut || !roomType || !guests) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        // Fetch total capacity
        const inventory = await RoomInventory.findOne({ roomType });
        // Default to 5 if not configured
        const totalCapacity = inventory ? inventory.totalCapacity : 5;
        const dateCapacities = inventory && inventory.dateCapacities ? Object.fromEntries(inventory.dateCapacities) : {};

        // Verify availability
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        const existingBookings = await Booking.find({
            roomType,
            status: { $ne: 'cancelled' },
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn }
        });

        // Check if any day is over capacity
        let overbooked = false;
        for (let curr = new Date(checkInDate); curr < checkOutDate; curr.setDate(curr.getDate() + 1)) {
            const dateStr = curr.toISOString().split('T')[0];
            let usedCount = 0;
            existingBookings.forEach(b => {
                const bCheckIn = new Date(b.checkIn).toISOString().split('T')[0];
                const bCheckOut = new Date(b.checkOut).toISOString().split('T')[0];
                if (dateStr >= bCheckIn && dateStr < bCheckOut) {
                    usedCount++;
                }
            });
            const dMax = dateCapacities[dateStr] !== undefined ? dateCapacities[dateStr] : totalCapacity;
            if (dMax - usedCount <= 0) {
                overbooked = true;
                break;
            }
        }
        
        if (overbooked) {
             return res.status(400).json({ error: 'Oops! The selected dates are fully booked for this room type.' });
        }

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
