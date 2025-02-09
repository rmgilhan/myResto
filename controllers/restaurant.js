const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Address = require('../models/Address');

module.exports.addRestaurant = async (req, res) => {
  
  const existingRestaurant = await Restaurant.exists({});
  if (existingRestaurant) {
    return res.status(400).json({ message: 'A restaurant already exists. You cannot add another one.' });
  }
  //Address info street, city, stateOrProvince, postalCode, country

  const { name, street, city, stateOrProvince, postalCode, country, phone, email } = req.body;

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Invalid name for the Restaurant." });
  }
  if (!stateOrProvince || typeof stateOrProvince !== "string" || stateOrProvince.trim() === "") {
    return res.status(400).json({ error: "Invalid Province or State for Address." });
  }
  if (!city || typeof city !== "string" || city.trim() === "") {
    return res.status(400).json({ error: "Invalid City for Address." });
  }
  if (!postalCode || typeof postalCode !== "string" || postalCode.trim() === "") {
    return res.status(400).json({ error: "Invalid postalCode for the Address." });
  }
  if (!country || typeof country !== "string" || country.trim() === "") {
    return res.status(400).json({ error: "Invalid country for the Address." });
  }

  try {

    // Check if the restaurant already exists
    const checkRestaurant = await Restaurant.findOne({ name: name.trim()});

    if (!checkRestaurant) {

      //Create Address of the Restaurant
      const restaurantAddress = new Address({
        street,city,stateOrProvince,postalCode,country
      });

      const savedRestoAddress = await restaurantAddress.save();

      if (!savedRestoAddress) {
        return res.status(400).json({ error: 'Failed to save address in database.' });
      }

      // Create a new Restaurant document
      const newRestaurant = new Restaurant({
        name: name.trim(),
        address: savedRestoAddress._id, // Assign saved address ID
        phone: phone,
        email: email
      });
  
      // Save the new restaurant to the database
      const savedRestaurant = await newRestaurant.save();
  
      // Return success response
      return res.status(201).json({ 
        message: "Restaurant created successfully.", 
        restaurant: savedRestaurant 
      });
    } else {
      // Restaurant already exists
      return res.status(409).json({ message: "Restaurant already exists in the database" });
    }
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports.updateRestaurant = async (req, res) => {
  
  const {restoId} = req.params;
  const { name, street, city, stateOrProvince, postalCode, country, phone, email } = req.body;

  // Validate required fields
  if (!restoId || !mongoose.Types.ObjectId.isValid(restoId)) {
    return res.status(400).json({ error: "Invalid restaurant ID." });
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Invalid restaurant name." });
  }
  if (!stateOrProvince || !city || !postalCode || !country) {
    return res.status(400).json({ error: "Invalid address details." });
  }

  try {
    // Find restaurant by ID
    
    console.log(restoId);
    const restaurant = await Restaurant.findById(restoId).populate("address");
    
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }

    // Update Address
    const updatedAddress = await Address.findByIdAndUpdate(
      restaurant.address._id,
      { $set: { street, city, stateOrProvince, postalCode, country } },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(400).json({ error: "Failed to update address." });
    }

    // Update Restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restoId,
      { $set: { name: name.trim(), phone: phone.trim(), email: email.trim() } },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(400).json({ error: "Failed to update restaurant." });
    }

    return res.status(200).json({
      message: "Restaurant updated successfully.",
      restaurant: updatedRestaurant,
      address: updatedAddress
    });

  } catch (error) {
    console.error("Error updating restaurant:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports.deleteRestaurant = async (req, res) => {
  try {
    const deletedRestaurant = await Restaurant.findOneAndDelete({ _id: req.params.restoId });

    if (!deletedRestaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.status(200).json({ message: "Restaurant and associated address deleted successfully." });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports.getRestaurant = async(req, res) => {

  const listRestaurant = await Restaurant.find()
    .populate("address", "street city stateOrProvince country -_id")
    .select("-createdAt -updatedAt -__v");

  if (listRestaurant){
    return res.status(201).json({message: 'Restaurant Details', listRestaurant});
  } else {
    return res.status(400).json({error: 'Unable to list the restaurant data.'});
  }
}
