const mongoose = require("mongoose");
const Menu = require("../models/Menu");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

module.exports.addMenu = async (req, res) => {

    if (!req.user.isAdmin) return res.status(403).json({ message: "Unauthorized." });

    const resto = await Restaurant.findOne().select('_id').lean();
    const { menuName, menuDescription, name, description, price } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Invalid name for the menu item." });
    }
    if (!price || typeof price !== "number" || price <= 0) {
        return res.status(400).json({ error: "Invalid price for the menu item." });
    }

    try {
        const menu = await Menu.findOne({ name: menuName });

        if (!menu) {
            //return res.status(404).json({ message: "Menu category not found." });
          
          const newMenu = new Menu({ 
              restaurant : resto._id,
              name: menuName, 
              description: menuDescription, 
              items: [] 
          });

          await newMenu.save(); // Save new menu inside transaction

        }

        const category = menuName;

        const checkItem = await MenuItem.findOne({name, category});

        if (!checkItem){        
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
        } else
            return res.status(201).json({message: "MenuItem is already in the database."});
            
    } catch (error) {
        return res.status(500).json({ message: "Failed to update menu", error: error.message });
    }
};


// Update Menu Item
module.exports.updateMenuItem = async (req, res) => {

  if (!req.user.roles || !req.user.roles.includes("Manager","Encoder")) {
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
      throw new Error("Menu item not found.");
    }


    return res.status(200).json({ message: "Menu item updated successfully", item: updatedItem });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete Menu Item
module.exports.deleteMenuItem = async (req, res) => {

  if (!req.user.roles || !req.user.roles.includes("Manager")) {
  return res.status(403).json({ message: "Unauthorized." });
}

  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid menu item ID." });
  }

  try {
    await Menu.updateMany(
      { items: itemId },
      { $pull: { items: itemId } }
    );

    const deletedItem = await MenuItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      throw new Error("Menu item not found.");
    }

    return res.status(200).json({ message: "Menu item deleted successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.getMenuItem = async(req, res) => {

    const resto = await Restaurant.findOne().select('_id').lean();
    // Step 1: Fetch the restaurant details once
    const restaurantData = await Restaurant.findOne({ _id: resto._id }) // Use the correct filter
      .select("name address -_id")
      .populate({
        path: "address",
        select: "street city stateOrProvince postalCode country -_id"
      })
      .lean();

    // Step 2: Fetch the menu and related items
    const menuList = await Menu.find({ restaurant: resto._id }) // Get all menus for this restaurant
      .select("name description -_id")
      .populate({
        path: "items",
        select: "_id name price description image"
      })
      .lean();


      if (!menuList){
        return res.status(200).json({message: "No menu item available."});
      } else {
        // Step 3: Combine data in the expected format
        const response = {
          restaurant: restaurantData,
          menus: menuList
        };

        // Step 4: Send the structured response
        //console.log(response);
        return res.status(200).json(response);
      }

}  
// Add Menu Item
// module.exports.addMenu = async (req, res) => {

//   if (!req.user.isAdmin) return res.status(403).json({ message: "Unauthorized." });

//   const { menuName, name, description, price, category, isAvailable } = req.body;

//   if (!name || typeof name !== "string" || name.trim() === "") {
//     return res.status(400).json({ error: "Invalid name for the menu item." });
//   }
//   if (!description || typeof description !== "string" || description.trim() === "") {
//     return res.status(400).json({ error: "Description is required." });
//   }
//   if (!price || typeof price !== "number" || price <= 0) {
//     return res.status(400).json({ error: "Invalid price for the menu item." });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const menu = await Menu.findOneAndUpdate(
//       { name: menuName },
//       { $setOnInsert: { name: menuName, description: "New Menu" } },
//       { new: true, upsert: true, session }
//     );

//     const newItem = new MenuItem({ name, description, price, category, isAvailable });
//     await newItem.save({ session });

//     menu.items.push(newItem._id);
//     await menu.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     const updatedMenu = await Menu.findById(menu._id).populate("items");

//     return res.status(201).json({ 
//       message: "Successfully added menu item", 
//       menu: updatedMenu 
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     return res.status(500).json({ message: "Failed to update menu", error: error.message });
//   }
// };