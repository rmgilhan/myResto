const express = require("express");
const orderController = require("../controllers/order");
const {verify, verifyAdmin, verifyRole} = require("../auth");
const router = express.Router();

//[POST] checkout order
router.post("/checkout",verify, verifyRole(['Customer']), orderController.checkoutOrder);
//[GET] Order List
router.get("/orderList",verify, verifyRole(['Customer']), orderController.getOrder);
//[PATCH] Order update
router.patch("/updateOrder",verify, verifyRole(['Customer']), orderController.updateOrder);

module.exports = router;
