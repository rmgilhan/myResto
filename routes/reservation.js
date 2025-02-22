const express = require("express");
const reservationController = require("../controllers/reservation");
const { verify, verifyAdmin, verifyRole } = require("../auth");
const router = express.Router();

router.post("/createReservation", verify, verifyRole(['Customer']), reservationController.createReservation);

router.patch("/updateStatus/:reservationId", verify, verifyRole(['Manager']), reservationController.updateReservation);

router.get("/listReservation", verify, verifyRole(['Manager']), reservationController.getReservation);

module.exports = router;