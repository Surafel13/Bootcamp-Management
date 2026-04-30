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
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, _success) => {
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

export const sendPasswordResetEmail = async (
  name: string,
  email: string,
  resetToken: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Dear <strong></strong>,</p>
      <p>You did not request a password reset. Click the link below to reset your password (valid for 1 hour):</p>
      
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><a href="${env.FRONTEND_URL}/reset-password/${resetToken}" style="color: #007bff; text-decoration: none;">Reset Password</a></p>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Reset Your Password
    
    Dear ${name},
    
    You did not request a password reset. Click the link below to reset your password (valid for 1 hour):
    
    Reset Password: ${env.FRONTEND_URL}/reset-password/${resetToken}
    
    If you did not request this, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-password-reset-email", {
      to: email,
      subject: "Reset Your Password - Account Created",
      html,
      text,
    });
    logger.info(`Password reset email queued for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue password reset email for ${email}:`, error);
    throw error;
  }
};

export const sendSessionCancellationEmail = async (
  name: string,
  email: string,
  session: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Session Cancellation</h2>
      <p>Dear <strong></strong>,</p>
      <p>Your session <strong>${session}</strong> has been cancelled.</p>
      <p>Please check the portal for updates.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Session Cancellation
    
    Dear ${name},
    
    Your session ${session} has been cancelled.
    
    Please check the portal for updates.
    
    If you didn't request this, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-session-cancellation-email", {
      to: email,
      subject: "Session Cancellation",
      html,
      text,
    });
    logger.info (`Session cancellation email queued for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue session cancellation email for ${email}:`, error);
    throw error;
  }
  
};

export const sendSessionExpirationEmail = async (
  name: string,
  email: string,
  session: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Session Expiration</h2>
      <p>Dear <strong></strong>,</p>
      <p>Your session <strong>${session}</strong> has expired.</p>
      <p>Please check the portal for updates.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Session Expiration
    
    Dear ${name},
    
    Your session ${session} has expired.
    
    Please check the portal for updates.
    
    If you didn't request this, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-session-expiration-email", {
      to: email,
      subject: "Session Expiration",
      html,
      text,
    });
    logger.info (`Session expiration email queued for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue session expiration email for ${email}:`, error);
    throw error;
  }
  
};

export const sendSessionStartEmail = async (
  name: string,
  email: string,
  session: string,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Session Start</h2>
      <p>Dear <strong></strong>,</p>
      <p>Your session <strong>${session}</strong> has started.</p>
      <p>Please check the portal for updates.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Session Start
    
    Dear ${name},
    
    Your session ${session} has started.
    
    Please check the portal for updates.
    
    If you didn't request this, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-session-start-email", {
      to: email,
      subject: "Session Start",
      html,
      text,
    });
    logger.info (`Session start email queued  for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue session start email for ${email}:`, error);
    throw error;
  }
  
};

export const sendTaskStartEmail = async (name: string, email: string, task: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Start</h2>
      <p>Dear <strong></strong>,</p>
      <p>Your task <strong>${task}</strong> has started.</p>
      <p>Please check the portal for updates.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Task Start
    
    Dear ${name},
    
    Your task ${task} has started.
    
    Please check the portal for updates.
    
    If you didn't request this, please ignore this email.
  `;

  try {
    const job = await emailQueue.add("send-task-start-email", {
      to: email,
      subject: "Task Start",
      html,
      text,
    });
    logger.info (`Task start email queued  for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue task start email for ${email}:`, error);
    throw error;
  }
  
};

export const sendTaskCompletionEmail = async (name: string, email: string, task: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Task Completion</h2>
      <p>Dear <strong></strong>,</p>
      <p>Your task <strong>${task}</strong> has been completed.</p>
      <p>Please check the portal for updates.</p>
      
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Task Completion
    
    Dear ${name},
    
    Your task ${task} has been completed.
    
    Please check the portal for updates.
    
    If you didn't request this, please ignore this email.
  `;  

  try {
    const job = await emailQueue.add("send-task-completion-email", {
      to: email,
      subject: "Task Completion",
      html,
      text,
    });
    logger.info (`Task completion email queued  for ${email}, job ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to queue task completion email for ${email}:`, error);
    throw error;
  }
  
};

// export const sendTaskGradeEmail = async (name: string, email: string, task: string) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #333;">Task Grade</h2>
//       <p>Dear <strong></strong>,</p>
//       <p>Your task <strong>${task}</strong> has been graded.</p>
//       <p>Please check the portal for updates.</p>
//
//       <p style="margin-top: 30px; font-size: 12px; color: #666;">
//         If you didn't request this, please ignore this email.
//       </p>
//     </div>
//   `;
//
//   const text = `
//     Task Grade
//
//     Dear ${name},
//
//     Your task ${task} has been graded.
//
//     Please check the portal for updates.
//
//     If you didn't request this, please ignore this email.
//   `;  
//
//   try {
//     const job = await emailQueue.add("send-task-grade-email", {
//       to: email,
//       subject: "Task Grade",
//       html,
//       text,
//     });
//     logger.info (`Task grade email queued  for ${email}, job ID: ${job.id}`);
//     return job;
//   } catch (error) {
//     logger.error(`Failed to queue task grade email for ${email}:`, error);
//     throw error;
//   }
//
// };

export const sendTaskGradeEmail = async (email: string, taskGrade: any) => {     
 const html =`
 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
 <h2 style="color: #333;">Task Grade</h2>
 <p>Dear <strong></strong>,</p>
 <p>Your task <strong>${taskGrade.taskTitle}</strong> has been graded.</p>
 <p>Score: ${taskGrade.score}/100</p>
 <p>Feedback: ${taskGrade.feedback || "No specific feedback provided."}</p>
 <p>View full details in the student portal.</p>
 <p style="margin-top: 30px; font-size: 12px; color: #666;">
 If you didn't request this, please ignore this email.
 </p>
 </div>
 `;

 const text = `
 Task Graded: ${taskGrade.taskTitle}
 
 Dear ${email},
 
 Your task ${taskGrade.taskTitle} has been graded.
 
 Score: ${taskGrade.score}/100
 
 Feedback: ${taskGrade.feedback || "No specific feedback provided."}
 
 View full details in the student portal.
 
 If you didn't request this, please ignore this email.
 `;

 try {
   const job = await emailQueue.add("send-task-grade-email", {
     to: email,
     subject: "Task Grade",
     html,
     text,
   });
   logger.info(`Task grade email queued  for ${email}, job ID: ${job.id}`);
   return job;
 } catch (error) {
   logger.error(`Failed to queue task grade email for ${email}:`, error);
   throw error;
 }
 
};