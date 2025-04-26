const express = require("express");
const orderController = require("../controllers/order");
const {verify, verifyAdmin, verifyRole} = require("../auth");
const router = express.Router();

//[POST] checkout order
router.post("/checkout",verify, verifyRole(['Customer']), orderController.checkoutOrder);
//[GET] Order List
router.get("/orderList/:orderId",verify, verifyRole(['Customer']), orderController.getOrder);
//[GET] OrderListing
router.get("/orderListing",verify, verifyRole(['Manager']), orderController.getAllOrders);
//[PATCH] Order update
router.patch("/updateOrder/:orderId",verify, verifyRole(['Manager']), orderController.updateStatusOrder);

module.exports = router;
