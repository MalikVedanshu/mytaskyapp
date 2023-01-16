import twilio from "twilio";
import config from 'config';


const {accountsid, auth,myphone} = config.get("sms");
async function sendSMS(smsData) {
    
    const {smsContent, phoneNumber} = smsData;
    const client = new twilio(accountsid, auth)

    let message = await client.messages
        .create({
            body: smsContent,
            from: myphone,
            to: phoneNumber
        })
        try {
            console.log(message.sid)
        }
        catch (err) {
            console.log(err)
            return err;
        }
}

export default sendSMS;