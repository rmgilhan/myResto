const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const userRoutes = require('./routes/user');
const menuRoutes = require('./routes/menu');
const restaurantRoutes = require('./routes/restaurant');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reservationRoutes = require('./routes/reservation');

const app = express();
const port = 4005;

// Ensure you are loading the environment variables from .env
if (dotenv.error) {
    throw new Error("Couldn't load .env file");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Set up the session middleware with environment variables
app.use(session({
    secret: process.env.SESSION_SECRET || "/auth", // Use SESSION_SECRET from .env or fallback
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB using the MONGODB_URI environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.log('MongoDB connection error:', err));


app.use("/resto/users", userRoutes);
app.use("/resto/menus", menuRoutes);
app.use("/resto/restoBuild", restaurantRoutes);
app.use("/resto/cart", cartRoutes);
app.use("/resto/order", orderRoutes);
app.use("/resto/reservation", reservationRoutes);

if (require.main === module) {
    app.listen(port, () => console.log(`API is now online on port ${port}`));
}

module.exports = { app, mongoose };
