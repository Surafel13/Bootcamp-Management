import { Document, Types } from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      activeRole?: string;
      activeDivisionId?: string | null;
    }
  }
}

export interface TokenPayload extends jwt.JwtPayload {
	id: string;
	role: string;
	divisionId?: string;
}

export interface IMembership {
  role: "division_admin" | "student";
  division: Types.ObjectId;
  joinedAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roles: ("super_admin" | "division_admin" | "student")[];
  firstLogin: boolean;
  memberships: IMembership[];
  divisions: Types.ObjectId[];
  status: "active" | "suspended" | "graduated";
  isPasswordChanged: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  getRoleInDivision: (divisionId: string) => string | null;
  isInDivision: (divisionId: string) => boolean;
  id: string;
}

export interface IDivision extends Document {
	name: string;
	description: string;
	createdAt: Date;
}

export interface INotification extends Document {
	user: Types.ObjectId;
	message: string;
	type: "system" | "session" | "task" | "resource" | "broadcast" | "reminder";
	read: boolean;
	createdAt: Date;
  broadcastType?: "division" | "bootcamp" | "all" | "single";
  broadcastAudience?: {
    divisionId?: Types.ObjectId;
    bootcampId?: Types.ObjectId;
    role?: "division_admin" | "student";
  };
}

export interface IBootcamp extends Document {
	name: string;
	description: string;
	duration: string;
	startDate: Date;
	endDate: Date;
	enrollmentDeadline: Date;
	instructor: Types.ObjectId;
	division: Types.ObjectId;
	creator: Types.ObjectId;
	status: "upcoming" | "ongoing" | "completed";
	getStatus?: () => "upcoming" | "ongoing" | "completed";
}

export interface ISession extends Document {
	bootcamp: Types.ObjectId | IBootcamp;
	title: string;
	description?: string;
	location?: string;
	onlineLink?: string;
	startTime: Date;
	endTime: Date;
	instructor: Types.ObjectId | IUser;
	division: Types.ObjectId | IDivision;
	status: "upcoming" | "active" | "completed" | "cancelled";
	qrGenerationCount: number;
	createdAt: Date;
}

export interface ITask extends Document {
	bootcamp: Types.ObjectId | IBootcamp;
	title: string;
	description: string;
	deadline: Date;
	session: Types.ObjectId;
	status: "active" | "inactive";
	allowedTypes: string[];
	formLink?: string;
	allowLateSubmission: boolean;
	maxScore: number;
	division: Types.ObjectId | IDivision;
	createdAt: Date;
	updatedAt: Date;
}

export interface IEnrollment extends Document {
	student: Types.ObjectId | IUser;
	bootcamp: Types.ObjectId | IBootcamp;
	status: "active" | "dropped" | "completed";
	createdAt: Date;
}

export interface ISubmission extends Document {
	student: Types.ObjectId | IUser;
	task: Types.ObjectId | ITask;
	fileUrl: string;
	githubLink: string;
	text: string;
	version: number;
	status: "submitted" | "graded" | "returned";
	score: number;
	feedback: string;
	isLate: boolean;
	gradedAt: Date;
	gradedBy: Types.ObjectId | IUser;
	submittedAt: Date;
	updatedAt: Date;
}

export interface IResource extends Document {
  title: string;
  description?: string;
  fileUrl?: string;
  publicId?: string;  
  externalLink?: string;
  type: "pdf" | "video" | "image" | "zip" | "link";
  bootcamp?: Types.ObjectId | IBootcamp;
  session?: Types.ObjectId | ISession;
  uploadedBy: Types.ObjectId | IUser;
  downloads: number;
  createdAt: Date;
}

export interface IAttendance extends Document {
	student: Types.ObjectId;
	session: Types.ObjectId | ISession | string;
	status: "present" | "absent" | "late" | "excused";
	markedBy: Types.ObjectId | IUser;
	qrToken?: string;
	note?: string;
	markedAt: Date;
	updatedAt: Date;
}

export interface IFeedback extends Document {
	session: Types.ObjectId | ISession;
	student: Types.ObjectId | IUser;
	rating: number;
	comment?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IGroup extends Document {
	name: string;
	description?: string;
	bootcamp: Types.ObjectId | IBootcamp | string;
	division: Types.ObjectId;
	leader?: string;
	members: Types.ObjectId[];
	memberNames: string[];
	createdBy: Types.ObjectId | IUser;
	createdAt: Date;
}

export interface IProgress extends Document {
	group: Types.ObjectId | IGroup;
	submittedBy: Types.ObjectId | IUser;
	title: string;
	description: string;
	feedback: string;
	status: "submitted" | "reviewed";
	score: number;
	reviewedAt: Date;
	reviewedBy: Types.ObjectId | IUser;	
	fileUrl?: string;
	link?: string;
	weekNumber: number;
	year: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface IInstructorAssignment extends Document {
	instructor: Types.ObjectId | IUser | string;
	bootcamp: Types.ObjectId | IBootcamp | string;
	permissions: ("manage_attendance" | "upload_resources" | "create_tasks" | "grade_submissions" | "view_feedback")[];
	startDate: Date;
	endDate: Date;
	assignedBy: Types.ObjectId | IUser;
	status: "active" | "expired" | "revoked";
	createdAt: Date;
	updatedAt: Date;
}

export interface IIpRange extends Document {
	name: string;
	startIP: string;
	endIP: string;
	isActive: boolean;
	createdBy: Types.ObjectId | IUser;
}

export interface IAuditLog extends Document {
	user: Types.ObjectId | IUser;
	action: string;
	entity: string;
	path: string;
	entityId: Types.ObjectId | null;
	timestamp: Date;
}
