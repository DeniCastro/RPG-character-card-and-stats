const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'Enemy' or 'NPC'
    name: { type: String, required: true },
    health: { type: Number },
    xpGained: { type: Number },
    damageDealt: { type: Number },
    damageReceived: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Character', CharacterSchema);