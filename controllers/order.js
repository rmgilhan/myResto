const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");

module.exports.checkoutOrder = async (req, res) => {
  try {
    // Step 1: Fetch customer's cart
    const menuOrders = await Cart.findOne({ userId: req.user.id })
		.select("items.menuItemId items.quantity items.price items.total"); //  Only return items from Cart

    console.log(req.user.id);
    console.log(menuOrders);

    if (!menuOrders || menuOrders.items.length === 0) {
      return res.status(400).json({ error: "There is no menu order by the customer." });
    }

    // Step 2: Create new order from Cart items
    const createOrder = new Order({
      customer: req.user.id,
      orderItems: menuOrders.items, // Extract only `items` array
    });

    const savedOrder = await createOrder.save();

    //  Step 3: Save the order
    if (savedOrder) {
      // Step 4: Remove cart after checkout
      await Cart.findOneAndDelete({ customer: req.user.id });

      // Step 5: Create payment for the order
      const newPayment = new Payment({
        order: savedOrder._id,
        amount: savedOrder.totalAmount,
      });

      const savedPayment = await newPayment.save();

      if (savedPayment) {
        // Step 6: Attach payment reference to the order
        const updatedOrder = await Order.findOneAndUpdate(
          { _id: savedOrder._id },
          { $set: { payment: savedPayment._id } }, // Directly set payment ID
          { new: true }
        );

        return res.status(201).json({ message: "Order placed successfully.", order: updatedOrder });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Error on saving order.", error: error.message });
  }
};

module.exports.getOrder = async(req, res) => {

	const orderList = await Order.findOne({customer: req.user.id });

	if (!orderList) {
		return res.status(404).json({message: "There is no active order for the customer."});
	}

	return res.status(201).json({message: 'Customer Order', orderList});
} 

module.exports.updateOrder = async (req, res) => {
  let { status } = req.body;

  try {
    // Update Order Status
    const orderUpdate = await Order.findOneAndUpdate(
      { customer: req.user.id, status: { $in: ["Pending", "Preparing"] } }, // ✅ Simplified OR condition
      { $set: { status } },
      { new: true }
    );

    console.log(orderUpdate);

    if (!orderUpdate) {
      return res.status(404).json({ message: "Failed to update the order status." });
    }

    // Convert "Cancelled" to "Fail"
    if (status === "Cancelled") {
      status = "Fail";
    }

    // Update Payment Status if order status is NOT "Preparing"
    if (status !== "Preparing") {
      const paymentUpdate = await Payment.findOneAndUpdate(
        { order: orderUpdate._id },
        { status },
        { new: true }
      );

      if (!paymentUpdate) {
        return res.status(400).json({ error: "Failed to update payment status." });
      }

      return res.status(200).json({ message: "Successfully updated order and payment status.", order: orderUpdate, payment: paymentUpdate });
    }

    // If status is "Preparing", just return success
    return res.status(200).json({ message: "Order successfully updated to Preparing status.", order: orderUpdate });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update", error: error.message });
  }
};





