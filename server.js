const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Character = require('./models/Character');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a new character/entry
app.post('/api/characters', async (req, res) => {
    try {
        const newChar = new Character(req.body);
        const savedChar = await newChar.save();
        res.status(201).json(savedChar);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all characters
app.get('/api/characters', async (req, res) => {
    try {
        const characters = await Character.find();
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});