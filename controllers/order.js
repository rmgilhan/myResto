const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const MenuItem = require("../models/MenuItem");
const Payment = require("../models/Payment");
const User = require("../models/User");

module.exports.createOrder = (req, res) => {
	//customer, menu, qty, orderType, 
	
	//customerId
	const userId = req.user.id;
	const {menu, qty, orderType} = req.body;

	const menuItem = MenuItem.findOne({name: menu}).select('_id price');

	const makeOrder = new Order({
		customer: userId,
		menuOrders.menuItem : menuItem._id,
		menuOrders.quantity : qty,
		menuOrders.price : qty * menuItem.price
	})

}
module.exports.addToOrder = (req, res) => {
	
}



