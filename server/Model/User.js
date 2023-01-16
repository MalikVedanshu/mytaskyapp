import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstname: {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    phone : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    verified : {
        email : { type : Boolean, default : false},
        phone : { type : Boolean , default : false }
    },
    tokens :  {
        email : {type : String, required : true},
        phone : { type : String, required : true} 
    },
    locked : {
        type: Boolean,
        default: false,
        required: true 
    },
    role: {
        type: String,
        default: "user"
    },
    wallet: {
        type: Number,
        default: 120
    },
    credits: {
        sms: {
            type: Number,
            required: true,
            default: 100
        },
        email: {
            type: Number,
            required: true,
            default: 100
        }
    },
    accountType: {
        type: String,
        default: 'Free'
    }
});
const UserModel = mongoose.model("User",userSchema,"user");
export default UserModel;   