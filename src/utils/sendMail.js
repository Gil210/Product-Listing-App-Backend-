// For requiring otp for email verification
const nodemail = require('nodemailer');

const sendMail = async (options) => {
    const transporter = nodemail.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true, //true for 465, false for other ports
        auth:{
            user: 'resend', //Email address
            pass: process.env.SMTP_PASSWORD //Email password
        }
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Haven'} <onboarding@resend.dev>`,
        to: options.email,
        subject: options.subject,
        html: options.html || options.message
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;