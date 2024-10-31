import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true        
    },
    phoneNo: {
        type:String,
        required: true        
    },
    reason: {
        type:String,
        required: true        
    },
    note: {
        type:String,
        required: true        
    },    
},{ timestamps:true }); 

// const User = mongoose.model("User", userSchema);
const users =  mongoose.model("users", userSchema);
export default users;