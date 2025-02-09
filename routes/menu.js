const express = require('express');
const menuController = require('../controllers/menu'); // Import menu controller methods
const { verify, verifyAdmin, verifyRole } = require("../auth");   // Import middleware for authentication and admin verification
const router = express.Router();

// [POST] Add a new menu item (Admin only)
router.post("/addMenu", verify, verifyRole(['Manager','Encoder']), menuController.addMenu);

//[GET] List a menu
router.get("/listMenu", menuController.getMenuItem);

// //[PATCH] Update a menu
router.patch("/:itemId/updateMenuItem", verify, verifyRole(['Manager', 'Encoder']), menuController.updateMenuItem);

// //[DELETE] Delete a menu
router.delete("/:itemId/removeMenuItem", verify,verifyRole(['Manager']), menuController.deleteMenuItem);

module.exports = router; // Export router

