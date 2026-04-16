const mongoose = require('mongoose');

const RoomInventorySchema = new mongoose.Schema({
    roomType: { type: String, required: true, unique: true },
    totalCapacity: { type: Number, required: true, default: 0 },
    dateCapacities: { type: Map, of: Number, default: {} }
});

RoomInventorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('RoomInventory', RoomInventorySchema);
