const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Character = require('./models/Character');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

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