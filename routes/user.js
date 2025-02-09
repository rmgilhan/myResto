const express = require('express');
const userController = require('../controllers/user'); // Import user controller methods
const { verify, verifyAdmin } = require("../auth");   // Import middleware for authentication and admin verification
const router = express.Router();

// [POST] Register a new user
router.post("/register", userController.registerUser);

// [POST] User login
router.post("/login", userController.loginUser);

// [GET] Get user details (requires authentication)
router.get("/details", verify, userController.getProfile);

// [GET] Get all users (admin only)
router.get("/", verify, verifyAdmin, userController.getAllUsers);

// [PATCH] Set a user as admin (admin only)
router.patch("/:id/setAsAdmin", verify, verifyAdmin, userController.setAsAdmin);

// [PATCH] Update password (requires authentication)
router.patch('/update-password', verify, userController.updatePassword);

// [PUT] Update user profile (requires authentication)
router.put('/profile', verify, userController.updateProfile);

module.exports = router; // Export the router
