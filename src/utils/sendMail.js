const { Resend } = require('resend');

const resend = new Resend(process.env.SMTP_PASSWORD); // Your re_ API key

const sendEmail = async (options) => {
  try {
    const data = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Haven'} <onboarding@resend.dev>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    });
    return data;
  } catch (error) {
    console.error('Resend API Error:', error);
    throw error;
  }
};

module.exports = sendEmail;