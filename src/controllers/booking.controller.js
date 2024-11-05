import bookings from "../models/bookings.model.js";
import slots from "../models/slots.model.js";
import users from "../models/users.model.js";
import mongoose from "mongoose"; // Import mongoose
const { ObjectId } = mongoose.Types; // Extract ObjectId from mongoose.Types
import { getIo } from "../service/socket.io.js";

const postBooking = async (req, res) => {
  try {
    const { name, phoneNo, reason, note, date, slot } = req.body;
    let selectedSlot = slot.split("_");
    let startTime = new Date(selectedSlot[0]);
    let endTime = new Date(selectedSlot[1]);

    const io = getIo();

    const pipeline = [
      {
        $match: {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      },
      {
        $project: { _id: 1 },
      },
    ];

    const slotDetails = await slots.aggregate(pipeline);

    if (slotDetails.length === 0) {
      return res.send({ message: "No slot found in db" });
    }

    const userDate = { name, phoneNo, reason, note };
    let _users = new users(userDate);
    let userId = _users._id;
    let slotId = slotDetails[0]._id;

    const bookingDetails = {
      userId,
      slotId,
      bookingDate: date,
      status: "confirm",
    };
    let _bookings = new bookings(bookingDetails);

    const createBooking = Promise.all([
      await _users.save(),
      await _bookings.save(),
    ])
      .then(async () => {
        const currentBooking = await bookings.find(
          {
            userId: userId,
            slotId: slotId,
            bookingDate: date,
          },
          {
            bookingDate: 1,
            _id: 0,
          }
        );

        if (!currentBooking.length) {
          throw new Error("No current booking found.");
        }

        const bookingDate = currentBooking[0].bookingDate;

        const availableSlots = await bookings.aggregate([
          { $match: { bookingDate: new Date(bookingDate) } },
          { $group: { _id: "$slotId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const availableSlotIds = availableSlots.map(
          (item) => new ObjectId(item._id)
        );

        const slotPipeline = [
          {
            $match: {
              $or: [
                { _id: { $in: availableSlotIds } },
                { _id: { $nin: availableSlotIds } },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              startTime: 1,
              endTime: 1,
              booked: { $cond: [{ $in: ["$_id", availableSlotIds] }, 1, 0] },
            },
          },
        ];

        const results = await slots.aggregate(slotPipeline);

        io.emit("update", { results, bookingDate, slotId });

        return res.status(201).send({
          status: "success",
          message: "Booking has been made",
          data: { createBooking },
        });
      })
      .catch((error) => {
        console.log(`error: ${error}`);
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", message: error.message });
  }
};

export { postBooking };
