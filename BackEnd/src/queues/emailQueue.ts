import { ConnectionOptions, Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import env from "../config/env.js"
import logger from "../utils/logger.js"

const redisConnection : ConnectionOptions = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  ...(env.REDIS_TLS === 'true' && { tls: {} }),
  retryStrategy: (times) => {
    const delay = Math.min(times * 1000, 30000);
    logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  enableReadyCheck: true,
  lazyConnect: true,
}

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter configuration error:', error);
  } else {
    logger.info('Email transporter is ready');
  }
});

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html, text } = job.data;
    
    logger.info(`Processing email job ${job.id} for ${to}`);
    
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      });

      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    lockDuration: 30000, 
    stalledInterval: 30000,
    maxStalledCount: 1,
    concurrency: 1,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

emailWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});

emailQueue.on('error', (err) => {
  logger.error('Queue error:', err);
});

const gracefulShutdown = async () => {
  logger.info('Closing email worker...');
  await emailWorker.close();
  await emailQueue.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

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
      
      <a href="${env.FRONTEND_URL}/login" 
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
    
    Login here: ${env.FRONTEND_URL}/login
    
    If you didn't request this account, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-welcome-email", {
      to: email,
      subject: "Welcome to Our CSEC - Account Created",
      html,
      text,
    });
    logger.info(`Welcome email queued for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue welcome email for ${email}:`, error);
    throw error;
  }
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
