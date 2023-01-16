import express from "express";
import authmiddleware from "../middlewares/auth/index.js";
import UserModel from "../Model/User.js";
import taskModel from "../Model/UsersTask.js";
import adminModel from "../Model/Admin.js";

const router = express.Router();
router.use(authmiddleware);
router.use((req,res,next) => {
    if(req.payload.role === "user") {
        return res.status(401).json({ msg: "Invalid user"});
    }
    next();
})

router.put("/suspend", async (req,res) => {
    try {
        let admin = await adminModel.findById(req.payload._id)
        if(!admin) return res.status(401).json({ msg: "Invalid user" });
        let uid = req.params.uid;
        let isUser = await UserModel.findOne({email: req.payload.email})
        if(isUser) return res.status(401).json({ msg: "Invalid user" });
        console.log("not invalid user");
        let editUser = await UserModel.findById(uid);
        if(!(editUser)) return res.status(401).json({ msg: "User you want to suspend is not found"});
        editUser.locked = true;
        await editUser.save();
        return res.status(200).json({msg: "User is suspended"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({err: "Internal server error"});
    }
})


router.delete("/deleteUser/:uid", async (req,res) => {
    try {
        let admin = await adminModel.findById(req.payload._id)
        if(!admin) return res.status(401).json({ msg: "Invalid user" });
        let uid = req.params.uid;
        let isUser = await UserModel.findById(req.payload._id)
        if(isUser) return res.status(401).json({ msg: "Invalid user" });
        let delUser = await UserModel.findById(uid);
        let editTaskData = await taskModel.findOne({user: uid})
        if(!(delUser || editTaskData)) return res.status(401).json({ msg: "User you want to delete is not found"});
        await UserModel.findOneAndDelete({_id : uid})
        await taskModel.findOneAndDelete({user: uid})

        return res.status(200).json({msg : "User and all the task data is deleted successfully"});
    }
    catch (error) {
        return res.status(500).json({err: "internal server error"});
    }
})

export default router;