const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');

//Graphql
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');

// Load environment variables
dotenv.config();

const userRoutes = require('./routes/user');
const menuRoutes = require('./routes/menu');
const restaurantRoutes = require('./routes/restaurant');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reservationRoutes = require('./routes/reservation');

//Cron Job scripts
// require('./jobs/archiveOldOrders'); // Load the cron job
// require('./jobs/deleteOldCarts');
// require('./jobs/deleteExpiredReservations');

const app = express();
const port = process.env.PORT || 4005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(session({
	secret: process.env.SESSION_SECRET || "/auth",
	resave: false,
	saveUninitialized: false
}));

//Graphql inclusion 
app.use('/resto/graphql', graphqlHTTP({
  schema: graphqlSchema,
  graphiql: true, // Enable browser IDE
}));

// Check if MONGODB_URI is available
if (!process.env.MONGODB_URI) {
	console.warn("Warning: MONGODB_URI is missing in environment variables.");
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
	.then(() => console.log('Now connected to MongoDB Atlas.'))
	.catch((err) => {
		console.error('MongoDB connection error:', err);
		process.exit(1); // Stop the app if can't connect
	});

// Routes
app.use("/resto/users", userRoutes);
app.use("/resto/menus", menuRoutes);
app.use("/resto/restoBuild", restaurantRoutes);
app.use("/resto/cart", cartRoutes);
app.use("/resto/order", orderRoutes);
app.use("/resto/reservation", reservationRoutes);

// Start the server
if (require.main === module) {
	app.listen(port, () => console.log(`API is now online on port ${port}`));
}

module.exports = { app, mongoose };
