import express from 'express';
import taskModel from "../Model/UsersTask.js";
import createReminder from '../utils/reminders.js';
import { cancelJob, scheduleJob } from "node-schedule";
import { taskValidationRules, errorMiddleware,taskEditValidationRules } from '../middlewares/validations/index.js';
import authmiddleware from '../middlewares/auth/index.js';
import sendEmail from "../utils/emails.js"
import sendSMS from '../utils/sms.js';
import adminModel from "../Model/Admin.js";

const router = express.Router();
router.use(authmiddleware);
router.use((req,res,next) => {
    if (req.payload.role == "admin") {
        return res.status(401).json({msg: "Access denied, invalid token."})
    }
    next();
})

/* 
    API Endpoint : /api/user/add/:uid
    Method : post
    Access type : public
    Validations :
        Reminder cannot be backdated, and input time should be more than current plus 30 mins
    
    Decription : Server 
*/

router.post("/add/", authmiddleware, taskValidationRules(), errorMiddleware, async (req, res) => {
    try {
        let adminCheck = await adminModel.findOne({email: req.payload.email})
        if(adminCheck) return res.status(401).json({ msg: "Invalid user, please enter a valid username and password" });
        const userID = req.payload._id;
        let taskUser = await taskModel.findOne({ user: userID }).populate("user");
        if (!taskUser) {
            return res.status(401).json({ msg: "user not found, please enter a valid username and password" });
        }
        let taskdata = req.body;
        let inputDate = new Date(taskdata.date).getTime();
        taskdata["reminders"] = createReminder(inputDate)
        taskUser.tasks.push(taskdata);
        await taskUser.save();
        res.status(200).json({ msg: "Task added succesfully" })
        let taskid = taskUser.tasks[taskUser.tasks.length - 1]._id.toString();
        let notificationType = taskUser.tasks[taskUser.tasks.length - 1].notification;

        taskdata.reminders.forEach((ele, idx) => {
            scheduleJob(`${taskUser.user.firstname}-${taskid}-${idx}`, ele, () => {
                if (notificationType == "email" || notificationType == "both") {
                    sendEmail({
                        toAddress: taskUser.user.email,
                        emailSubject: `Reminder : Scheduler App alert`,
                        emailBody: `Hi, ${taskUser.user.firstname} this is reminder ${idx + 1} to let you know that your task : ${taskdata.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `
                    });
                }
                if (notificationType == "sms" || notificationType == "both") {
                    sendSMS({
                        smsContent: `Hi, ${taskUser.user.firstname} this is reminder ${idx + 1} to let you know that your task : ${taskdata.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `,
                        phoneNumber: taskUser.user.phone
                    })
                }
            })
        })



    }
    catch (error) {
        res.status(500).json({ msg: 'task incomplete' });
    }
})

/* 
    API Endpoint : /api/task/edit/:uid/:rid
    Method : put
    Access type : public
    Validations :
        UserId and reminder ID should be there
        Reminder cannot be backdated, and input time should be more than current plus 30 mins
    Decription : Server 

*/

router.put("/edit/:rid", authmiddleware, taskEditValidationRules(), errorMiddleware, async (req, res) => {
    try {
        let adminCheck = await adminModel.findOne({email: req.payload.email})
        if(adminCheck) return res.status(401).json({ msg: "Invalid user, please enter a valid username and password" });
        let uid = req.payload._id;
        let rid = req.params.rid;
        let taskData = await taskModel.findOne({ user: uid }).populate("user");
        if (!taskData) {
            return res.status(200).json({ msg: "user not found" })
        }
        let matchIndex = taskData.tasks.findIndex(ele => ele._id.toString() == rid);
        if (matchIndex == -1) {
            return res.status(200).json({ msg: "task not found" })
        }
        taskData.tasks[matchIndex].reminders.forEach((ele, idx) => {
            cancelJob(`${taskData.user.firstname}-${rid}-${idx}`);
        })
        let taskk = req.body;
        if (taskk.isCompleted === true) {
            taskData.tasks[matchIndex].isCompleted = true;
            taskData.tasks[matchIndex].taskname = taskk.taskname;
            taskData.tasks[matchIndex].date = taskk.date;
            taskData.save();
            return res.status(200).json({ msg: "Your task details are updated, no further reminders for the task are scheduled" })
        }
        taskData.tasks[matchIndex].taskname = taskk.taskname;
        taskData.tasks[matchIndex].date = taskk.date;
        taskData.tasks[matchIndex].reminders = createReminder(new Date(taskk.date));
        taskData.tasks[matchIndex].reminders.forEach((ele, idx) => {
            scheduleJob(`${taskData.user.firstname}-${rid}-${idx}`, ele, () => {
                if (taskk.notification === "email" || taskk.notification === "both") {
                    sendEmail({
                        toAddress: taskData.user.email,
                        emailSubject: `Reminder : Scheduler App alert`,
                        emailBody: `Hi, ${taskData.user.firstname} this is reminder ${idx} to let you know that your task : ${taskk.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `
                    });
                }
                if (taskk.notification === "sms" || taskk.notification === "both") {
                    sendSMS({
                        smsContent: `Hi, ${taskData.user.firstname} this is reminder ${idx} to let you know that your task : ${taskk.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `,
                        phoneNumber: taskData.user.phone
                    })
                }
            })
        })
        taskData.save()
        return res.status(200).json({ msg: "Task is successfully updated. New reminders are scheduled." });

    }
    catch (error) {
        return res.status(400).json({ error: "cannot update your request" });
    }
})

/* 
    API Endpoint : /api/task/delete/:rid
    Method : delete
    Access type : public
    Validations :
        UserId and reminder ID should be there
    Decription : Server 


*/

router.delete("/delete/:reminderId", authmiddleware, errorMiddleware, async (req, res) => {
    try {
        let userId = req.payload._id;
        let reminderId = req.params.reminderId;
        let taskData = await taskModel.findOne({ user: userId }).populate("user");
        if (!taskData) {
            return res.status(200).json({ msg: "Invalid User" })
        }
        let matchIndex = taskData.tasks.findIndex(ele => ele._id == reminderId);
        if (matchIndex == -1) {
            return res.status(200).json({ msg: "task data not found" })
        }
        taskData.tasks[matchIndex].reminders.forEach((ele, idx) => {
            cancelJob(`${taskData.user.firstname}-${reminderId}-${idx}`);
        })

        taskData.tasks.splice(matchIndex, 1);
        taskData.save();
        res.status(200).json({ msg: "Data deleted successfully" })
    }
    catch (error) {
        res.status(400).json({ error: "cannot update your request" });
    }
})

/* 
    API Endpoint : /api/task/all/:uid/
    Method : get
    Access type : public
    Validations :
        should be valid userId
    Decription : get all tasks 


*/

router.get("/all", authmiddleware, async (req, res) => {
    try {
        let userId = req.payload._id;
        let taskData = await taskModel.findOne({ user: userId });
        if (!taskData) {
            return res.status(200).json({ msg: "Task not found" })
        }
        // let returnTask = taskData.tasks.map(ele => ele.tasks)
        res.status(200).json({ "tasks": taskData.tasks })
    }
    catch (err) {
        res.status(400).json({ err: "internal server error" })
    }
})


/* 
    API Endpoint : /api/task/edit/:uid/:rid
    Method : put
    Access type : public
    Validations :
        UserId and reminder ID should be there
        Reminder cannot be backdated, and input time should be more than current plus 30 mins
    Decription : get a pirticular task 

*/

router.get("/:tid", authmiddleware, async (req, res) => {
    let uid = req.payload._id;
    let tid = req.params.tid;
    let taskdata = await taskModel.findOne({ user: uid })
    let returnTask = taskdata.tasks.find(ele => ele._id.toString() == tid)
    if (!returnTask) {
        return res.status(401).json({ error: "Task not found" })
    }
    return res.status(200).json({ task: returnTask.taskname, date: returnTask.date })
})

export default router;