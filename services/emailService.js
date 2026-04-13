const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

exports.sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: '"BMS Admin" <noreply@bms.com>',
    to, subject, text
  });
};