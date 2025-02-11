const express = require("express");
const cartController = require("../controllers/cart");
const { verify, verifyAdmin, verifyRole} = require("../auth");   // Import middleware for authentication and admin verification
const router = express.Router();

//[POST] add to cart
router.post("/addToCart", verify, verifyRole(['Customer']),cartController.addToCart);

//[PATCH] update Cart
router.patch("/updateCart", verify, verifyRole(['Customer']),cartController.updateCart);

//[GET] List the user Cart
router.get("/getCart", verify, verifyRole(['Customer']),cartController.getCart);

//[DELETE] remove menuitem to cart
router.delete("/removeToCart/:menuItemId", verify, verifyRole(['Customer']),cartController.deleteToCart);

module.exports = router;