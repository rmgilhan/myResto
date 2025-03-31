const mongoose = require('mongoose');
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

module.exports.addToCart = async (req, res) => {
    
    const userId = req.user.id;
    const { menuItemId, quantity } = req.body;

    try {
        let userCart = await Cart.findOne({ userId });

        // If cart does not exist, create one
        if (!userCart) {
            userCart = new Cart({ userId, items: []});
        }

        const menuItem = await MenuItem.findById(menuItemId).select('price');

        if (!menuItem) {
            return res.status(400).json({ message: 'Menu Item not found' });
        }

        // Check if item already exists in cart
        const itemIndex = userCart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        if (itemIndex === -1) {
            // Item not in cart, add new item
            userCart.items.push({
                menuItemId,
                quantity: quantity,
                price: menuItem.price
            });
        } else {
            // Item exists, update quantity
            userCart.items[itemIndex].quantity += quantity;
        }
      
        const savedUserCart = await userCart.save();

        if (savedUserCart){
            return res.status(201).json({ message: "Successfully added to cart", cart: savedUserCart });
        } else{ 
        	return res.status(400).json({error: error.message});
        }
    } catch (error) {
        return res.status(500).json({ message: "Failed to update Cart", error: error.message });
    }
};

module.exports.updateQuantityCart = async (req, res) => {
  
  const userId = req.user.id;
  try {
    const { menuItemId, quantity } = req.body;

    // Convert menuItemId to ObjectId
    const menuItemObjectId = new mongoose.Types.ObjectId(menuItemId);

    // Find the user's cart
    const userCart = await Cart.findOne({ userId });

    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    // Check if the menuItem exists
    const menuItem = await MenuItem.findById(menuItemObjectId);
    if (!menuItem) return res.status(400).json({ message: "Menu item not found" });

    // Find and update the quantity
    
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(req.user.id), "items.menuItemId": menuItemObjectId },
      {
        $set: {
          "items.$.quantity": Math.max(1, Number(quantity)), // Ensure quantity is at least 1
          "items.$.total": menuItem.price * Math.max(1, Number(quantity)), // Update total price
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Success", updatedCart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
};

module.exports.getCart = async(req,res) => {

	const userCart = await Cart.findOne({ userId: req.user.id })
    .populate({
        path: "items.menuItemId",  
        select: "name description image", 
    })
    .select("items quantity price total _id userId");


	try {
		if (!userCart) {
			return res.status(400).json({message: "Your cart is empty."});
		} else {
			return res.status(201).json({message: "Customer selected menus", userCart});
		}
	} catch (error) {
		return res.status(500).json({error: error.message});
	}
}

module.exports.deleteToCart = async (req, res) => {
  const { menuItemId } = req.params;

  try {
    // Step 1: Find the cart first
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Step 2: Check if the menuItemId exists in the cart
    const itemExists = cart.items.some(item => item.menuItemId.toString() === menuItemId);

    if (!itemExists) {
      return res.status(404).json({ message: "Menu item not found in cart." });
    }

    // Step 3: Remove item from the cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { menuItemId } } },
      { new: true }
    );

    return res.status(200).json({ message: "MenuItem removed.", updatedCart });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

