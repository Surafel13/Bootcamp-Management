import nodemailer from "nodemailer";
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
	await transporter.sendMail({
		from: '"BMS Admin" <noreply@bms.com>',
		to,
		subject,
		text,
	});
};
