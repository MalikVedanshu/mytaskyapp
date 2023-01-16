import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();
import sendEmail from "../utils/emails.js";
import sendSMS from "../utils/sms.js";
import config from "config";
import randomToken from "../utils/randomToken.js";
import { userLoginValidation,userRegisterValidationRules, errorMiddleware } from "../middlewares/validations/index.js";
import UserModel from "../Model/User.js";
import TaskModel from "../Model/UsersTask.js";
import CryptoJS from "crypto-js";
import adminModel from "../Model/Admin.js";

/* 
    API Endpoint : /api/user/register
    Method : post
    Access type : public
    Validations :
        Strong password Password, unique Email, first name length atlease 2 chars
        Address is optional 
        Password and Password2 should match  
    Description : create New User in DB
*/

router.post("/register", userRegisterValidationRules(), errorMiddleware,  async (req, res) => {
    try {
        let checkuser = await UserModel.findOne({ email: req.body.email })
        if (checkuser) {
            return res.status(409).json({msg : "user email address is already registered"})
        }
        let checkAdmin = await adminModel.findOne({ email: req.body.email })
        if(checkAdmin) {
            return res.status(409).json({msg: "user email address is already registered"})
        }
            let userdata = new UserModel(req.body);
            let taskdata = new TaskModel();
            
            taskdata.user = userdata._id;
            userdata.password = await bcrypt.hash(req.body.password, 12);

            userdata.tokens.email=  randomToken(16);
            userdata.tokens.phone =  randomToken(8);

            let emailToken = jwt.sign({email: userdata.tokens.email},config.get("JWTemailKey"),{expiresIn: "5h"})
            let phoneToken = jwt.sign({phone: userdata.tokens.phone},config.get("JWTphoneKey"),{expiresIn: "5h"})

            await userdata.save();
            await taskdata.save();
            sendEmail({
                toAddress: userdata.email,
                emailSubject: "User Account verification - Ved org.",
                emailBody: `Hi, ${userdata.firstname} thank you for signing up, please click  the <a href="${config.get('dev_url')}/api/user/verify/email/${emailToken}"> link here </a> to verify `
            })
            sendSMS ({
                smsContent : `Hi, ${userdata.firstname} thank you for signing up, please click  the link :  "${config.get('dev_url')}/api/user/verify/phone/${phoneToken}" to verify `,
                phoneNumber : userdata.phone
            })
            res.status(200).send({ msg: "Email/SMS sent successfully"});
    }
    catch (error) {
        res.status(500).send({ error: "internal server error" });
    }
})

/* 
    API Endpoint : /api/user/verify/email/:token
    Method : get
    Access type : public
    Validations : 
    Description : Validate and change verified email to true
*/

router.get("/verify/email/:token", async (req,res) => {
    try {
        let verifiedToken = jwt.verify(req.params.token,config.get("JWTemailKey"))
        let emailUser = await UserModel.findOne({ "tokens.email" : verifiedToken.email })
        if(emailUser.verified.email) {
            return res.status(200).send("this user is already registered");
        }
        emailUser.verified.email = true;
        await emailUser.save()
        // await UserModel.findOneAndUpdate({ "tokens.email" : req.params.token }, {"verified.email" : true})
        res.status(200).send("This email is now registered with scheduler app")
    }
    catch (err) {
        res.status(500).send("Link is expired")
    }
    
})


/* 
    API Endpoint : /api/user/verify/phone/:token
    Method : get
    Access type : public
    Validations : twt token authentication 
    Description : Validate and change verified phone to true
*/

router.get("/verify/phone/:token", async (req,res) => {
    try {
        let verifiedToken = jwt.verify(req.params.token,config.get("JWTphoneKey"))
        let phoneUser = await UserModel.findOne({ "tokens.phone" : verifiedToken.phone })
        if(phoneUser.verified.phone) {
            return res.status(200).send("this user is already registered");
        }
        phoneUser.verified.phone = true;
        await phoneUser.save()
        res.status(200).send("This phone number is now registered with scheduler app")
    }
    catch (err) {
        res.status(500).send("Unable to register this phone number. Internal server error")
    }
})


/* 
    API Endpoint : /api/user/login
    Method : POST
    Access type : Public 
    Validations :
        userLogin validation, 
    Description : Return JWT token which eventually sent to headers and held by auth middleware
*/

router.post("/login", userLoginValidation(), errorMiddleware, async (req,res) => {
    try {
        const {email,password} = req.body;
        let adminData = await adminModel.findOne({email})
        if (adminData) {
            const isValid = await bcrypt.compare(password, adminData.password);
            if(!isValid) return res.status(401).json({msg: "email or password did not match"})
            if(adminData.role !== req.body.role) return res.status(401).json({msg: "Invalid user/a"})
            let token = jwt.sign({_id : adminData._id, email : adminData.email, role: adminData.role}, 
                config.get("jwt_secret_key"),
                    {expiresIn: 60 * 60});
            let encryptToken = CryptoJS.AES.encrypt(JSON.stringify(token), config.get("cryptojs_secret_key")).toString();
            return res.status(200).json({token : encryptToken});
        }
        const userData = await UserModel.findOne({email : email});
        if(!userData) return res.status(401).json({error : "Invalid credentials, email did not match"})
        const isValid = await bcrypt.compare(password, userData.password);
        if(!isValid) return res.status(401).send({error : "Invalid credentials, email or password did not match"})
        
        if(userData.locked) {
            return res.status(401).json({error: "Your account is supended. Contact admin"})
        }
        
        if(!(userData.verified.email)) {
            return res.status(401).json({err : "Email Address is not verified"})
        }
        if(!(userData.verified.phone)) {
            return res.status(401).json({err: "Phone number is not verified"})
        }
        let token = jwt.sign({_id : userData._id, email : userData.email}, 
            config.get("jwt_secret_key"),
                {expiresIn: 60 * 60});
                
        let encryptToken = CryptoJS.AES.encrypt(JSON.stringify(token), config.get("cryptojs_secret_key")).toString();
        return res.status(200).json({token : encryptToken});
    }
    catch (error) {
        console.log(error)
        res.status(400).json({error: "internal server error"})
    }
})


export default router;