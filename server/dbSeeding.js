import "./utils/dbConnect.js";
import bcrypt from "bcrypt";
import adminData from "./Model/Admin.js"

async function insertNewAdmin() {
    try {
        let password = await bcrypt.hash("Temp@124", 12);
        let admin = new adminData({
            firstname : "Super Admin",
            email : "malikvedanshu711@gmail.com",
            password,
            role: "admin"
        })
        await admin.save();
        console.log("new admin is created")
    }
    catch (err) {
        console.log(err);
    }
}
insertNewAdmin();