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
	role: "super_admin" | "division_admin" | "student";
	divisions: Types.ObjectId[];
	status: "active" | "suspended" | "graduated";
	createdAt: Date;
}

export interface ISession extends Document {
	startTime: Date;
	endTime: Date;
	division: Types.ObjectId | IDivision;
	status: "active" | "inactive";
	createdAt: Date;
}

export interface ITask extends Document {
	title: string;
	description: string;
	deadline: Date;
	session: Types.ObjectId;
	status: "active" | "inactive";
	allowedTypes: string;
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
	fileUrl: string;
	type: "pdf" | "video" | "image" | "zip" | "link";
	session: Types.ObjectId;
	uploadedBy: Types.ObjectId;
	createdAt: Date;
}

export interface INotification extends Document {
	user: Types.ObjectId | IUser;
	message: string;
	type: "task" | "grade" | "session" | "general";
	read: boolean;
	createdAt: Date;
}

export interface IAttendance extends Document {
	student: Types.ObjectId;
	session: Types.ObjectId | ISession;
	status: "attend" | "permission" | "absent";
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
	description: string;
	division: Types.ObjectId;
	members: Types.ObjectId[];
	createdBy: Types.ObjectId | IUser;
}

export interface IDivision extends Document {
	name: string;
	description: string;
	createdBy: Types.ObjectId | IUser;
	sessions: Types.ObjectId[] | ISession[];
	tasks: Types.ObjectId[] | ITask[];
	submissions: Types.ObjectId[] | ISubmission[];
	createdAt: Date;
}
