import { Document, Types } from "mongoose";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	roles: ("super_admin" | "division_admin" | "student")[];
	divisions: Types.ObjectId[];
	status: "active" | "suspended" | "graduated";
	passwordResetToken?: string;
	passwordResetExpires?: Date;
	createdAt: Date;
	id: string;
}

export interface ISession extends Document {
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
	submittedAt: Date;
}

export interface IResource extends Document {
	title: string;
	description?: string;
	fileUrl: string;
	externalLink?: string;
	type: "pdf" | "video" | "image" | "zip" | "link";
	session: Types.ObjectId;
	uploadedBy: Types.ObjectId;
	downloads: number;
	createdAt: Date;
}

export interface INotification extends Document {
	user: Types.ObjectId | IUser;
	message: string;
	type: "task" | "grade" | "session" | "progress" | "general";
	read: boolean;
	createdAt: Date;
}

export interface IAttendance extends Document {
	student: Types.ObjectId;
	session: Types.ObjectId | ISession;
	status: "present" | "absent" | "late" | "excused";
	note?: string;
	markedAt: Date;
	updatedAt: Date;
}

export interface IAuditLog extends Document {
	user: Types.ObjectId | IUser;
	action: string;
	entity: string;
	path: string;
	entityId: Types.ObjectId | null;
	timestamp: Date;
}

export interface IIpRange extends Document {
	name: string;
	startIP: string;
	endIP: string;
	isActive: boolean;
	createdBy: Types.ObjectId | IUser;
}

export interface IGroup extends Document {
	name: string;
	description?: string;
	division: Types.ObjectId;
	leader?: string;
	members: Types.ObjectId[];
	memberNames: string[];
	createdBy: Types.ObjectId | IUser;
	createdAt: Date;
}

export interface IDivision extends Document {
	name: string;
	description: string;
	createdAt: Date;
}

export interface IFeedback extends Document {
	session: Types.ObjectId | ISession;
	student: Types.ObjectId | IUser;
	rating: number;
	comment?: string;
	createdAt: Date;
}

export interface IProgress extends Document {
	group: Types.ObjectId | IGroup;
	submittedBy: Types.ObjectId | IUser;
	title: string;
	description: string;
	fileUrl?: string;
	link?: string;
	weekNumber: number;
	year: number;
	createdAt: Date;
}
