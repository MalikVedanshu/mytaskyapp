import jwt from "jsonwebtoken";
import config from "config";
import CryptoJS from "crypto-js";

function authmiddleware(req,res,next) {
    try {
        let token = req.headers["z-auth-token"];
        var bytes = CryptoJS.AES.decrypt(token, config.get("cryptojs_secret_key"));
        let decryptToken = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        let decoded = jwt.verify(decryptToken, config.get("jwt_secret_key"))
        req.payload = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({error: "Access denied. Invalid input"})
    }
}

export default authmiddleware;