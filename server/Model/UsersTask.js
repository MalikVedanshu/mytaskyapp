import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks: [
        {
            taskname: {
                type : String,
                required : true
            },
            date : {
                type : String,
                required : true
            },
            reminders : {
                type : Array,
                required : true
            },
            isCompleted : {
                type: Boolean,
                default: false
            },
            notification : {
                type: String,
                default: "both"
            }
        }
    ]
});
export default mongoose.model("Task",taskSchema,"userTask");