import bookings from "../models/bookings.model.js";
import slots from "../models/slots.model.js";
import users from "../models/users.model.js";
import mongoose from 'mongoose'; // Import mongoose
const { ObjectId } = mongoose.Types; // Extract ObjectId from mongoose.Types
import { getIo } from "../service/socket.io.js";

const postBooking = async (req, res) => {
    try {
        const { name, phoneNo, reason, note, date, slot } = req.body;
        let selectedSlot = slot.split('_');
        let startTime = new Date(selectedSlot[0]);
        let endTime = new Date(selectedSlot[1]);

        const io = getIo();

        const pipeline = [
            {
                $match: {
                    startTime: { $gte: startTime },
                    endTime: { $lte: endTime }
                }
            },
            {
                $project: { _id: 1 }
            }
        ];

        const slotDetails = await slots.aggregate(pipeline);

        if (slotDetails.length === 0) {
            return res.send({ message: "No slot found in db" });
        }

        const userDate = { name, phoneNo, reason, note };
        let _users = new users(userDate);
        let userId = _users._id;
        let slotId = slotDetails[0]._id;

        const bookingDetails = { userId, slotId, bookingDate: date, status: "confirm" };
        let _bookings = new bookings(bookingDetails);

        const createBooking = Promise.all([await _users.save(), await _bookings.save()])
            .then(async () => {
                const currentBooking = await bookings.find(
                    {
                        userId: userId,
                        slotId: slotId,
                        bookingDate: date
                    },
                    {                       
                        bookingDate: 1,
                        _id: 0
                    }
                );

                if (!currentBooking.length) {
                    throw new Error("No current booking found.");
                }

                const bookingDate = currentBooking[0].bookingDate;
                
                console.log('bookingDate', bookingDate);

                const availableSlots = await bookings
                    .aggregate([
                        { $match: { bookingDate: new Date(bookingDate) } },
                        { $group: { _id: "$slotId", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ]);

                const availableSlotIds = availableSlots.map(item => new ObjectId(item._id));

                const slotPipeline = [
                    {
                        $match: {
                            $or: [
                                { _id: { $in: availableSlotIds } },
                                { _id: { $nin: availableSlotIds } }
                            ]
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            startTime: 1,
                            endTime: 1,
                            booked: { $cond: [{ $in: ['$_id', availableSlotIds] }, 1, 0] }
                        }
                    }
                ];

                const results = await slots.aggregate(slotPipeline);

                io.emit('update', {results, bookingDate, slotId});

                console.log("result-->", results);

                return res.status(201).send({
                    status: "success",
                    message: "Booking has been made",
                    data: { createBooking }
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

const __postBooking  = async(req, res) => {
    try {        
        const { name, phoneNo, reason, note, date, slot } = req.body;                
        // console.log(name, phoneNo, reason, note, date, slot);        
        let selectedSlot = slot.split('_');
        let startTime = new Date(selectedSlot[0]);
        let endTime = new Date(selectedSlot[1]);
        
        const io = getIo();

        const pipeline = [
            {
                $match: {                    
                    startTime: { $gte: startTime },
                    endTime: { $lte: endTime }
                }
            },
            {
                $project: { _id: 1 } // Only project the _id field if you only need the ID
            }
        ];

        const slotDetails = await slots.aggregate(pipeline); 
        
        console.log('slotDetails', slotDetails)
        
        if (slotDetails.length === 0) { 
            return res.send({ message: "No slot found in db" });
        }

        const userDate = { name, phoneNo, reason, note }
        // const slotDetails = { startTime, endTime }    

        let _users = new users(userDate)
        // let _slots = new slots(slotDetails);         

        let userId = _users._id
        let slotId = slotDetails[0]._id;
        
        console.log('slotId', slotId);
        
        const bookingDetails = { userId, slotId, bookingDate:date, status:"confirm" }
        
        let _bookings = new bookings(bookingDetails);
        
        // after saving user and slot then save booking with userId and slotId
        const createBooking = Promise.all([await _users.save(), await _bookings.save()])
            .then(async (response) => {    

                // fetch booking details of current users with time slot and booking_date, then send data to frontend to update view.        
              
                const currentBooking = await bookings.find(
                    { 
                        userId:userId, 
                        slotId:slotId, 
                        bookingDate:date,                        
                    },
                    {
                        userId:0,
                        slotId:0,
                        bookingDate:1,
                        _id:0
                    }
                );           
                
            console.log('currentBooking', currentBooking[0].bookingDate);
                 
            const date = currentBooking[0].bookingDate;
            
            return date;
            }).then( async(date) => {
                 // fetch booking details which match with selected date
        const avilableSlots = await bookings
        .aggregate([
            { $match: { bookingDate: new Date(date) } },
            { $group: { _id: "$slotId", count: { $sum: 1 } } },
            { $sort: { count: -1 } }, 
        ]);
       
        // match that slotId with available slots        
        console.log('return booked slots', avilableSlots);   
        
        // Convert _id strings to ObjectIds
        const available_slot_id = avilableSlots.map((item)=> new ObjectId(item._id));
        console.log('av_id',available_slot_id);

        // Aggregation pipeline
        const pipeline = [
            {
                $match: {
                    $or: [
                        { _id: { $in: available_slot_id } }, // Match documents with the given _ids
                        { _id: { $nin: available_slot_id } }  // Match documents NOT in the given _ids
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    startTime: 1,
                    endTime: 1,
                    booked: { $cond: [{ $in: ['$_id', available_slot_id] }, 1, 0] } // Set booked to 1 for matched, 0 for unmatched
                }
            }
        ];

        const results = await slots.aggregate(pipeline);


                    io.emit('update', {'currentBooking':currentBooking})  
                    console.log(response);      
        
                }).catch((error)=>{
                    console.log(`error:${error}`);
                }); 

            return res.status(201).send({
                status:"success",
                message:"Booking has made",
                data: {createBooking}
            });                                 
        } catch (error) {
            console.log(error);
        }
    }

export {
    postBooking
}