// For requiring otp for email verification
const nodemail = require('nodemailer');

const sendMail = async (options) => {
    const transporter = nodemail.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, //true for 465, false for other ports
        auth:{
            user: process.env.SMTP_EMAIL, //Email address
            pass: process.env.SMTP_PASSWORD //Email password
        }
    });

    const mailOptions = {
        from: `Haven <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html || options.message
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;