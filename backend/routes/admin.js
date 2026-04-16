const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const RoomInventory = require('../models/RoomInventory');
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
            
            const msgPayload = {
                body: message,
                to: twilioPhoneNumber
            };
            // Fallback to direct phone number if messaging service is not set
            if (process.env.TWILIO_PHONE_NUMBER) {
                msgPayload.from = process.env.TWILIO_PHONE_NUMBER;
            } else {
                msgPayload.messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
            }
            
            const twilioRes = await client.messages.create(msgPayload);
            console.log(`Twilio SMS sent successfully to ${twilioPhoneNumber}. SID: ${twilioRes.sid}`);
        } catch (smsErr) {
            console.error('Failed to send SMS via Twilio', smsErr.message, smsErr.code, smsErr.moreInfo);
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

// Inventory Management Routes
router.get('/inventory', async (req, res) => {
    try {
        const inventory = await RoomInventory.find();
        // Serialize Mongoose Maps to plain objects for frontend
        const serialized = inventory.map(item => ({
            roomType: item.roomType,
            totalCapacity: item.totalCapacity,
            dateCapacities: item.dateCapacities ? Object.fromEntries(item.dateCapacities) : {}
        }));
        res.json(serialized);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

router.put('/inventory', async (req, res) => {
    const { roomType, totalCapacity, date, capacity } = req.body;

    if (!roomType) return res.status(400).json({ error: 'roomType is required' });

    try {
        let updatedDoc;

        if (date !== undefined && date !== null && date !== '') {
            // ── Date-specific override ──────────────────────────────────────
            // Use MongoDB dot-notation to set a single key inside the Map.
            // This is the ONLY reliable way to update Mongoose Maps.
            const dateKey = String(date);
            const capValue = Number(capacity);   // allows 0 (fully blocks that date)

            updatedDoc = await RoomInventory.findOneAndUpdate(
                { roomType },
                {
                    $set: { [`dateCapacities.${dateKey}`]: capValue },
                    // If the document doesn't exist yet, also set a default totalCapacity
                    $setOnInsert: { totalCapacity: 5 }
                },
                { upsert: true, new: true, runValidators: true }
            );
        } else if (totalCapacity !== undefined) {
            // ── Global default capacity ─────────────────────────────────────
            updatedDoc = await RoomInventory.findOneAndUpdate(
                { roomType },
                { $set: { totalCapacity: Number(totalCapacity) } },
                { upsert: true, new: true, runValidators: true }
            );
        } else {
            return res.status(400).json({ error: 'Provide either totalCapacity or date+capacity' });
        }

        res.json({
            roomType: updatedDoc.roomType,
            totalCapacity: updatedDoc.totalCapacity,
            dateCapacities: updatedDoc.dateCapacities
                ? Object.fromEntries(updatedDoc.dateCapacities)
                : {}
        });

    } catch (err) {
        console.error('Inventory save error:', err);
        res.status(500).json({ error: 'Failed to update inventory', detail: err.message });
    }
});

module.exports = router;

