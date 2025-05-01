const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Reservation = require("../models/Reservation");

module.exports.checkoutOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Fetch customer's cart
    const menuOrders = await Cart.findOne({ userId: req.user.id })
      .select("items.menuItemId items.quantity items.price items.total")
      .session(session); // Bind session

    if (!menuOrders || menuOrders.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "There is no menu order by the customer." });
    }

    // Step 2: Create new order
    const createOrder = new Order({
      customer: req.user.id,
      orderItems: menuOrders.items,
    });

    const savedOrder = await createOrder.save({ session });

    // Step 3: Remove cart after checkout
    await Cart.findOneAndDelete({ userId: req.user.id }).session(session);

    // Step 4: Create payment for the order
    const newPayment = new Payment({
      order: savedOrder._id,
      amount: savedOrder.totalAmount,
    });

    const savedPayment = await newPayment.save({ session });

    // Step 5: Attach payment reference to the order
    await Order.findOneAndUpdate(
      { _id: savedOrder._id },
      { $set: { payment: savedPayment._id } },
      { new: true, session }
    );

    // Step 6: Update User's Customer data
    const updateUserOrder = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { orders: savedOrder._id } },
      { new: true, session }
    );

    if (!updateUserOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Unable to update the Customer order." });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Success", order: savedOrder });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Error on saving order.", error: error.message });
  }
};


// module.exports.checkoutOrder = async (req, res) => {
//   try {
//     // Step 1: Fetch customer's cart
//     const menuOrders = await Cart.findOne({ userId: req.user.id })
// 		.select("items.menuItemId items.quantity items.price items.total"); //  Only return items from Cart

//     console.log(menuOrders);

//     if (!menuOrders || menuOrders.items.length === 0) {
//       return res.status(400).json({ error: "There is no menu order by the customer." });
//     }

//     // Step 2: Create new order from Cart items
//     const createOrder = new Order({
//       customer: req.user.id,
//       orderItems: menuOrders.items, // Extract only `items` array
//     });

//     const savedOrder = await createOrder.save();

//     //  Step 3: Save the order
//     if (savedOrder) {
//       // Step 4: Remove cart after checkout
//       const cartDeleteMenus = await Cart.findOneAndDelete({ userId: req.user.id });

//       if (!cartDeleteMenus) {
//       	return res.status(400).json({message: 'Menus at cart unable to delete.'});
//       }
//       // Step 5: Create payment for the order
//       const newPayment = new Payment({
//         order: savedOrder._id,
//         amount: savedOrder.totalAmount,
//       });

//       const savedPayment = await newPayment.save();

//       if (savedPayment) {
//         // Step 6: Attach payment reference to the order
//         const updatedOrder = await Order.findOneAndUpdate(
//           { _id: savedOrder._id },
//           { $set: { payment: savedPayment._id } }, // Directly set payment ID
//           { new: true }
//         );

//         //Update the User's Customer data
//         const updateUserOrder = await User.findOneAndUpdate(
//         	{_id: req.user.id},
//         	{$push: {orders: savedOrder._id}},
//         	{new: true});
        
//         if (!updateUserOrder){
//         	return res.status(400).json({error: 'Unable to update the Customer order.'})
//         }
//       		return res.status(201).json({message: "Order placed successfully.", order: updatedOrder});
//       }
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "Error on saving order.", error: error.message });
//   }
// };

module.exports.getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({ isArchive: false })
      .populate({
        path: "customer",
        select: "firstName lastName -_id"
      })
      .populate({
        path: "orderItems.menuItemId",
        select: "name"
      });

    const reservations = await Reservation.find({});

    const responseData = {
      orderList: allOrders || [], // always return array
      reservations: reservations || [],
      customerMsg: allOrders.length > 0
        ? "Customers Order"
        : "There is no active order from the Customers.",
      reservationMsg: reservations.length > 0
        ? "Customer's Reservation"
        : "There are no active Customer's reservation."
    };

    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving orders.",
      error: error.message
    });
  }
};


module.exports.getOrder = async (req, res) => {

    const orderId = Number(req.params.orderId);

    try {
        let orders = await Order.find({ customer: req.user.id })
              .select({})
              .populate({
                path: "orderItems.menuItemId",
                select: "name"
              });
        let reservations = await Reservation.find({ customer: req.user.id });

        // Ensure orderList always contains an array
        let orderList = { orderItems: orders.length ? orders : [] };

        // Determine message
        let msg = orders.length === 0 ? "There is no active order for the customer." : "Customer Orders";

        // Return data based on orderId
        if (orderId === 1) {
            return res.status(200).json({ message: msg, orderList });
        }
        return res.status(200).json({ message: msg, orderList, reservations });

    } catch (error) {
        return res.status(500).json({ message: "Error retrieving orders.", error: error.message });
    }
};

module.exports.updateStatusOrder = async (req, res) => {
  let { status } = req.body;
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.status === status) {
      return res.status(201).json({ message: `Order is already in ${status} status.` });
    }

    // Update status and save (triggers pre/post save hooks)
    order.status = status;
    await order.save(); // This triggers your pre('save') and post('save') hooks

    // If status is Cancelled, convert to Fail for payment
    const paymentStatus = status === "Cancelled" ? "Fail" : status;

    if (status !== "Preparing") {
      const paymentUpdate = await Payment.findOneAndUpdate(
        { order: order._id },
        { status: paymentStatus },
        { new: true }
      );

      if (!paymentUpdate) {
        return res.status(400).json({ error: "Failed to update payment status." });
      }
    }

    return res.status(200).json({ message: "Success", order });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update", error: error.message });
  }
};


module.exports.payOrder = async (req, res) => {
  const { paymentMethod, refId } = req.body;
  let paymentOrder;

  try {
    // Find customer's pending/preparing order
    const order = await Order.findOne({
      customer: req.user.id,
      status: { $in: ["Pending", "Preparing"] }
    });

    if (!order) {
      return res.status(400).json({ message: "Unable to find customer order." });
    }

    // Update Payment Status
    const paymentUpdateData = paymentMethod !== "Cash" 
      ? { status: "Completed", method: paymentMethod, transactionId: refId }
      : { status: "Completed" };

    paymentOrder = await Payment.findOneAndUpdate(
      { _id: order.payment },
      { $set: paymentUpdateData },
      { new: true }
    );

    if (!paymentOrder) {
      return res.status(400).json({ message: "Failed to process payment. Try again!" });
    }

    // Update Order Status to "Completed"
    const updateOrder = await Order.findOneAndUpdate(
      { _id: order._id },
      { $set: { status: "Completed" } },
      { new: true }
    );

    return res.status(200).json({ message: "Payment successful. Order completed!", order: updateOrder, payment: paymentOrder });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};





