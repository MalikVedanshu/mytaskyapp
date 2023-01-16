import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    firstname: {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role: {
        type: String,
        default: "user"
    }
});
const Admin = mongoose.model("Admin",adminSchema,"admin");

export default Admin;