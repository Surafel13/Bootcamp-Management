import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import env from "../config/env.js"

const redisConnection = { 
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
}

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
});

const transporter = nodemailer.createTransport({
	service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html, text } = job.data;
    
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@yourapp.com",
        to,
        subject,
        text,
        html,
      });
      
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Our CSEC!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> <span style="background-color: #fff; padding: 5px; font-family: monospace;">${password}</span></p>
      </div>
      
      <p><strong>Important:</strong> Please change your password after your first login.</p>
      
      <a href="${process.env.APP_URL}/login" 
         style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        Login to Your Account
      </a>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this account, please ignore this email.
      </p>
    </div>
  `;
  
  const text = `
    Welcome to Our CSEC!
    
    Dear ${name},
    
    Your account has been created successfully. Here are your login credentials:
    
    Email: ${email}
    Temporary Password: ${password}
    
    Important: Please change your password after your first login.
    
    Login here: ${process.env.APP_URL}/login
    
    If you didn't request this account, please ignore this email.
  `;
  
  await emailQueue.add("send-welcome-email", {
    to: email,
    subject: "Welcome to Our CSEC - Account Created",
    html,
    text,
  });
};

export const generateRandomPassword = (length: number = 12): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = "";

  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
