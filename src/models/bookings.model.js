import mongoose from "mongoose";

const bookingSchmea = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',     
        required: true         
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,      
        ref: 'slots',
        required: true       
    },
    bookingDate: {
        type: Date, 
        required: true
    },
    bookingDate: {
        type: Date, 
        required: true  
    },
    status: {
        type:String,
        required: true        
    },   
},{ timestamps:true }); 

const bookings = mongoose.model("bookings", bookingSchmea)

export default bookings;


/*
//  _id: mongoose.Schema.Types.ObjectId, auto generated in mongodb
    // or
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     default: function () {
    //       return new mongoose.Types.ObjectId();
    //     },
    //     unique: true,
    //   },
*/ 
