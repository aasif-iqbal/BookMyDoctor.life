import mongoose, { Model } from "mongoose";

const slotsSchema = new mongoose.Schema({
    date:{
        type:String,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
      },
    endTime: {
        type: Date,
        required: true,
    },    
}, {
    timestamps: true
});

const slots = mongoose.model("slots", slotsSchema);

export default slots;
