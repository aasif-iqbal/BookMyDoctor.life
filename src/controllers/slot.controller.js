import slots from "../models/slots.model.js";
import bookings from "../models/bookings.model.js";
import mongoose from 'mongoose'; // Import mongoose
const { ObjectId } = mongoose.Types; // Extract ObjectId from mongoose.Types
// fetch all slots detail for initial page loading
const getSlots = async(req, res) => {
    try {
        const _slots = await slots.find();
        
        return res.status(200).send({
            status:"success",
            message:"All slots details",
            data: {_slots}
        });                                  
    } catch (error) {
        console.log(error);
        res.status(500).send({message: error.message}); 
    }
}    

const getAvailableSlots = async(req, res) => {
    
    try {
        const date = req.params.date;
            
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

    console.log("Matching slots with startTime and endTime:", results);
        return res.status(200).send({
            status:"success",
            message:"All Booked slots details",
            data: {results}
        });                                  
    } catch (error) {
        console.log(error);
        res.status(500).send({message: error.message}); 
    }
}       

export { getSlots, getAvailableSlots } 