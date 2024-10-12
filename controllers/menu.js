const bcrypt = require('bcrypt');
const Menu = require("../models/Menu");
const MenuItem = require("../models/MenuItem");
const auth = require("../auth");

module.exports.addMenu = async (req, res) => {
  const { menuName, menuDescription, name, description, price } = req.body;

  try {
    // Check if the menu category exists
    const menu = await Menu.findOne({ name: menuName });

    if (!menu) {
      return res.status(404).json({ error: "Menu category not found." });
    }

    // Create a new MenuItem
    const newItem = new MenuItem({
      name,
      description,
      price
    });

    // Save the new MenuItem
    const itemSaved = await newItem.save();

    if (!itemSaved) {
      return res.status(500).json({ error: "Unable to save the menu item." });
    }

    // Add the new MenuItem's ID to the menu's `items` array
    const updatedMenu = await Menu.findOneAndUpdate(
      { name: menuName }, // Find the menu by name
      { $push: { items: itemSaved._id } }, // Push the new item's ID into the `items` array
      { new: true } // Return the updated document
    );

    if (updatedMenu) {
      return res.status(201).json({ message: "Successfully added menu item", menu: updatedMenu });
    } else {
      return res.status(500).json({ error: "Failed to update the menu with the new item." });
    }

  } catch (error) {
    console.error('Error updating menu:', error);
    return res.status(500).json({ message: 'Failed to update menu', error });
  }
};
