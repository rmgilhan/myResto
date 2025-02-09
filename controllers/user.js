const bcrypt = require("bcrypt");
const Joi = require("joi");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const auth = require("../auth");

// Validation Schemas
const userRegisterSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  mobileNo: Joi.string().pattern(/^\d{11}$/).required(),
  password: Joi.string().min(8).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Register User
module.exports.registerUser = async (req, res) => {
  try {
    // Validate input
    const { error, value } = userRegisterSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { firstName, lastName, email, mobileNo, password } = value;

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { mobileNo }] });
    if (existingUser) return res.status(400).json({ error: "Email or mobile number already exists." });

    // Get the first restaurant ID
    const restaurant = await Restaurant.findOne().select('_id').lean();
    let newUser;

    if (!restaurant) {
      newUser = new User({ 
          firstName, 
          lastName, 
          email, 
          mobileNo, 
          password, 
          restaurant: null, 
          roles: ['Admin'],  // Use array for roles
          isAdmin: true 
      });
    } else {
      newUser = new User({ 
          firstName, 
          lastName, 
          email, 
          mobileNo, 
          password, 
          restaurant: restaurant._id // Assign only the ID
      });
    }
    // Create and save user
    
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login User
module.exports.loginUser = async (req, res) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;

    console.log(password);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found." });

    console.log(user.password);

    //const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password." });

    const accessToken = auth.createAccessToken(user);
    return res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get User Profile
module.exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
};

// Set User as Admin
module.exports.setAsAdmin = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Unauthorized." });

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isAdmin) return res.status(400).json({ message: "User is already an admin." });

    user.isAdmin = true;
    await user.save();

    return res.status(200).json({ message: "User successfully set as admin." });
  } catch (error) {
    console.error("Error setting admin status:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Update Password
module.exports.updatePassword = async (req, res) => {
  try {
    const { error, value } = passwordUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { currentPassword, newPassword } = value;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Current password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Users
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
};

// Update Profile
module.exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobileNo } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, mobileNo },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile." });
  }
};
