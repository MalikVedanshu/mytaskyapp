import nodemailer from 'nodemailer';
import config from 'config';
const { host, auth,port  } = config.get("email_smtp");
async function sendEmail(emailData) {
  
    try {
      const { toAddress, emailSubject, emailBody } = emailData;
        let transporter = nodemailer.createTransport({
            host,
            port,
            secure: true, // true for 465, false for other ports
            auth: {
              user: auth.user, // generated ethereal user
              pass: auth.pass, // generated ethereal password
            },
          });
          let info = await transporter.sendMail({
            from: '"Ved 👻" <dash@malikved.com>', // sender address
            to: toAddress, // list of receivers
            subject: "hello" + emailSubject, // Subject line
            html: emailBody, // html body
          });
          console.log("Message sent: %s", info.messageId);

    } catch (err) {
        console.log(err);
    }
    
}

export default sendEmail;

