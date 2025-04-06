const mongoose = require("mongoose");
const Reservation = require("../models/Reservation");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

module.exports.createReservation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get the first restaurant ID
        const restaurant = await Restaurant.findOne().select('_id').lean();
        if (!restaurant) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'No restaurant found.' });
        }

     const { reservationDate, numberOfGuests, specialRequests } = req.body;

    // Validate Date and Time
    const today = new Date();
    const reserveDate = new Date(reservationDate);

    if (reserveDate < today) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Reservation date must be in the future." });
    }


    // Validate Time Format (HH:MM:SS)
    // const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    // if (!timeRegex.test(reservationTime)) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return res.status(400).json({ message: "Invalid time format. Use HH:MM:SS (24-hour format)." });
    // }

    //const checkDate = await Reservation.findOne({reservationDate: reserveDate, reservationTime: reservationTime});
    const checkDate = await Reservation.findOne({reservationDateAndTime: reserveDate});
    
    if (checkDate){
	  await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Reservation already exists." });
    }

    // Create Reservation
    const createReserve = new Reservation({
      restaurant: restaurant._id,
      customer: req.user.id,
      reservationDateAndTime: reserveDate,
      //reservationTime: reservationTime, // Store time as a String
      numberOfGuests: numberOfGuests,
      specialRequests: specialRequests,
      approvedBy : req.user.id
    });

    const saveReservation = await createReserve.save({ session });

    if (!saveReservation) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Unable to create reservation." });
    }

         // Step 6: Update User's Customer data
	    const updateUserReservation = await User.findOneAndUpdate(
	      { _id: req.user.id },
	      { $push: { reservations: saveReservation._id } },
	      { new: true, session }
	    );

	    if (!updateUserReservation) {
		    await session.abortTransaction();
		    session.endSession();
		    return res.status(400).json({ error: "Unable to update the Customer reservation." });
    }

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ message: 'Success' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ error: error.message });
    }
};

module.exports.updateReservation = async (req, res) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  const { reservationId } = req.params;
  const { status, remarks } = req.body;

  try {
    // Check if the reservation is already updated
    const checkReservation = await Reservation.findOne({ _id: reservationId, status });

    if (checkReservation) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Reservation status already updated." });
    }

    // Update reservation
    const reservationUpdate = await Reservation.findOneAndUpdate(
      { _id: reservationId },
      { $set: { status, approvedBy: req.user.id, remarks } },
      { new: true, session }
    );

    if (!reservationUpdate) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Unable to update reservation status." });
    }

    await session.commitTransaction();

    return res.status(201).json({ message: "Reservation successfully changed status", reservation: reservationUpdate });

  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ error: error.message });
  } finally {
    session.endSession(); // Ensure session is always closed
  }
};

module.exports.getReservation = async (req, res) => {
  try {
    // Step 1: Fetch restaurant details (Only one query)
    const restaurantData = await Restaurant.findOne()
      .select("name address -_id")
      .populate({
        path: "address",
        select: "street city stateOrProvince postalCode country -_id"
      })
      .lean();

    if (!restaurantData) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Step 2: Get start of the current day (for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ensure we're comparing from midnight onwards

    // Step 3: Fetch reservations for today or later
    const listReservation = await Reservation.find({
      reservationDateAndTime: { $gte: today } // Include today's reservations
    })
      .populate({
        path: "customer",
        select: "firstName lastName mobileNo -_id" // Fixed comma issue
      })
      .select("reservationDateAndTime numberOfGuests status _id")
      .lean();

    if (!listReservation.length) {
      return res.status(404).json({ message: "No reservations found." });
    }

    const formattedReservations = listReservation.map(res => ({
      ...res,
      reservationDateAndTime: new Date(res.reservationDateAndTime).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).replace(',', '') // Remove comma between date and time
    }));

    return res.status(200).json({
      restaurantData,
      formattedReservations
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
