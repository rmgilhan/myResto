const express = require('express');
const restaurantController = require('../controllers/restaurant');
const { verify, verifyAdmin, verifyRole } = require("../auth");   // Import middleware for authentication and admin verification
const router = express.Router();

//[POST] add restaurant
router.post("/addRestaurant", verify, verifyRole(['Admin']), restaurantController.addRestaurant);

//[PATCH] update restaurant
router.patch("/updateRestaurant/:restoId", verify, verifyRole(['Admin']), restaurantController.updateRestaurant);

//[GET] List restaurant

router.get("/listRestaurant", verify, verifyRole(['Admin']),restaurantController.getRestaurant);

//[DELETE] Delete Restaurant data.

router.delete("/removeRestaurant/:restoId", verify, verifyRole(['Admin']), restaurantController.deleteRestaurant);

module.exports = router;