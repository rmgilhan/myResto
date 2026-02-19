const mongoose = require("mongoose");
const Menu = require("../models/Menu");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

// ---------------------------
// REST + GraphQL Internal Methods
// ---------------------------

// Add Menu Item
module.exports.addMenu = async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: "Unauthorized." });

  const resto = await Restaurant.findOne().select('_id').lean();
  const { menuName, menuDescription, name, description, price } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Invalid name for the menu item." });
  }
  if (!price || typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Invalid price for the menu item." });
  }

  try {
    let menu = await Menu.findOne({ name: menuName });

    // If menu category doesn't exist, create it
    if (!menu) {
      menu = new Menu({ 
        restaurant: resto._id,
        name: menuName, 
        description: menuDescription, 
        items: [] 
      });
      await menu.save();
    }

    const category = menuName;
    const checkItem = await MenuItem.findOne({ name, category });

    if (!checkItem) {
      const newItem = new MenuItem({ name, description, price, category });
      const itemSaved = await newItem.save();

      const updatedMenu = await Menu.findOneAndUpdate(
        { name: menuName },
        { $push: { items: itemSaved._id } },
        { new: true }
      );

      if (!updatedMenu) {
        return res.status(500).json({ message: "Failed to update the menu with the new item." });
      }

      return res.status(201).json({ message: "Successfully added menu item", menu: updatedMenu });
    } else {
      return res.status(200).json({ message: "MenuItem is already in the database." });
    }

  } catch (error) {
    return res.status(500).json({ message: "Failed to update menu", error: error.message });
  }
};

// Internal version for GraphQL
module.exports.addMenuInternal = async ({ menuName, menuDescription, name, description, price }) => {
  const resto = await Restaurant.findOne().select('_id').lean();

  let menu = await Menu.findOne({ name: menuName });

  if (!menu) {
    menu = new Menu({ 
      restaurant: resto._id,
      name: menuName, 
      description: menuDescription, 
      items: [] 
    });
    await menu.save();
  }

  const category = menuName;
  const checkItem = await MenuItem.findOne({ name, category });

  if (!checkItem) {
    const newItem = new MenuItem({ name, description, price, category });
    const itemSaved = await newItem.save();

    const updatedMenu = await Menu.findOneAndUpdate(
      { name: menuName },
      { $push: { items: itemSaved._id } },
      { new: true }
    );

    return updatedMenu;
  }

  return menu;
};

// ---------------------------
// Update Menu Item
// ---------------------------
module.exports.updateMenuItem = async (req, res) => {
  if (!req.user?.roles?.some(role => ["Manager", "Encoder"].includes(role))) {
    return res.status(403).json({ message: "Unauthorized." });
  }

  const { itemId } = req.params;
  const { name, description, price, category, isAvailable } = req.body;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid menu item ID." });
  }

  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      itemId,
      { name, description, price, category, isAvailable },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu Item not found." });
    }

    return res.status(200).json({ message: "Success", item: updatedItem });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Internal version for GraphQL
module.exports.updateMenuItemInternal = async ({ id, name, description, price, category, isAvailable }) => {
  return await MenuItem.findByIdAndUpdate(
    id,
    { name, description, price, category, isAvailable },
    { new: true, runValidators: true }
  );
};

// ---------------------------
// Delete Menu Item
// ---------------------------
module.exports.deleteMenuItem = async (req, res) => {
  if (!req.user?.roles?.includes("Manager")) {
    return res.status(403).json({ message: "Unauthorized." });
  }

  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid menu item ID." });
  }

  try {
    await Menu.updateMany({ items: itemId }, { $pull: { items: itemId } });
    const deletedItem = await MenuItem.findByIdAndDelete(itemId);

    if (!deletedItem) return res.status(404).json({ message: "Menu item not found." });

    return res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Internal version for GraphQL
module.exports.deleteMenuItemInternal = async ({ id }) => {
  await Menu.updateMany({ items: id }, { $pull: { items: id } });
  return await MenuItem.findByIdAndDelete(id);
};

// ---------------------------
// Get Menu Items
// ---------------------------
module.exports.getMenuItem = async (req, res) => {
  const resto = await Restaurant.findOne().select('_id').lean();

  const restaurantData = await Restaurant.findOne({ _id: resto._id })
    .select("name address -_id")
    .populate({ path: "address", select: "street city stateOrProvince postalCode country -_id" })
    .lean();

  const menuList = await Menu.find({ restaurant: resto._id })
    .select("name description -_id")
    .populate({ path: "items", select: "_id name price description image category isAvailable" })
    .lean();

  if (!menuList || menuList.length === 0) {
    return res.status(200).json({ message: "No menu item available." });
  }

  return res.status(200).json({ restaurant: restaurantData, menus: menuList });
};

// Internal version for GraphQL
module.exports.getMenuItemInternal = async () => {
  const resto = await Restaurant.findOne().select('_id').lean();

  const menuList = await Menu.find({ restaurant: resto._id })
    .populate({ path: "items", select: "_id name price description image category isAvailable" })
    .lean();

  return menuList;
};
 