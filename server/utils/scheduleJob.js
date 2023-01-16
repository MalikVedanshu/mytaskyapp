import { scheduleJob } from "node-schedule";
import sendSMS from "./sms.js";
import sendEmail from "./emails.js";
function scheduleTask(user) {
    let reminders = user.tasks.reminders;
    reminders.forEach((ele,idx) => {
        scheduleJob(`A${idx}`,ele, async () => {
            await sendEmail({
                toAddress: user.email,
                emailSubject: `Reminder : ${user.tasks.taskname}`,
                emailBody: `Hi, ${user.firstname} this is a reminder to let you know that your task : ${user.tasks.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `
            })
            await sendSMS({
                smsContent : `Hi, ${user.firstname} this is a reminder to let you know that your task : ${user.tasks.taskname} is pending. If activity is done and you no longer want to recieve the reminder, you can click here. Thanks `,
                phoneNumber : user.phone
            })
        })
    })
}
export default scheduleTask;