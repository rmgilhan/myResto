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
            userCart = new Cart({ userId, items: [] });
        }

        const menuItem = await MenuItem.findById(menuItemId).select('price');

        if (!menuItem) {
            return res.status(400).json({ message: 'Menu Item not found' });
        }

        // Check if item already exists in cart
        const itemIndex = userCart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        //console.log(itemIndex);

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
        	console.log("Save at database.")
            return res.status(201).json({ message: "Successfully added to cart", cart: savedUserCart });
        } else{ 
        	console.log("Unable to save.")
        	return res.status(400).json({error: error.message});
        }
    } catch (error) {
        return res.status(500).json({ message: "Failed to update Cart", error: error.message });
    }
};

module.exports.updateCart = async(req, res) => {

  try {
    const { menuItemId, quantity } = req.body;

    const userCart = await Cart.findOne({ user: req.user._id });

    if (!userCart) return res.status(404).json({ message: "Cart not found" });

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(400).json({ message: "Menu item not found" });

    const existingItem = userCart.items.find(item => item.menuItemId.equals(menuItemId));

    if (existingItem) {
      existingItem.quantity = Math.max(1, Number(quantity)); // ✅ Avoid zero/negative quantities
    } else {
      userCart.items.push({
        menuItemId,
        quantity: Math.max(1, Number(quantity)),
        price: menuItem.price // ✅ Store price at checkout
      });
    }

    const updatedCart = await userCart.save(); // ✅ Trigger pre('save')

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }

}

module.exports.getCart = async(req,res) => {

	const userCart = await Cart.findOne({userId : req.user.id});
	try {
		if (!userCart) {
			return res.status(400).json({message: "User has no menu selected in the Cart. Try to select our delicious menus!"});
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

    return res.status(200).json({ message: "Menu successfully removed from cart.", updatedCart });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

