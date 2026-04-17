import type { Request, Response, NextFunction } from "express";
import Group from "../models/group.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Admin creates a group (size 2–8, one per student per division)
export const createGroup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { members, division } = req.body;

		if (!members || !Array.isArray(members)) {
			return next(new AppError("Members array is required", 400, { members: "Required" }));
		}

		if (members.length < 2 || members.length > 8) {
			return next(
				new AppError("Group size must be between 2 and 8 students", 422, {
					members: "Invalid group size",
				}),
			);
		}

		// Check if any member already belongs to a group in this division
		const existingMembership = await Group.findOne({
			division,
			members: { $in: members },
		});

		if (existingMembership) {
			return next(
				new AppError(
					"One or more students already belong to a group in this division",
					409,
					{ members: "Duplicate group membership" },
				),
			);
		}

		const group = await Group.create({
			...req.body,
			createdBy: req.user!._id,
		});

		await group.populate("members", "name email");
		await group.populate("division", "name");

		res.status(201).json({ status: "success", data: { group } });
	},
);

export const getAllGroups = catchAsync(async (req: Request, res: Response) => {
	const { division } = req.query;
	const filter: Record<string, any> = {};
	if (division) filter.division = division;

	const groups = await Group.find(filter)
		.populate("members", "name email")
		.populate("division", "name")
		.populate("createdBy", "name")
		.sort("name");

	res.status(200).json({
		status: "success",
		results: groups.length,
		data: { groups },
	});
});

export const getGroupById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const group = await Group.findById(req.params.id)
			.populate("members", "name email status")
			.populate("division", "name description")
			.populate("createdBy", "name");

		if (!group)
			return next(new AppError("Group not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { group } });
	},
);

export const updateGroup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})
			.populate("members", "name email")
			.populate("division", "name");

		if (!group)
			return next(new AppError("Group not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { group } });
	},
);

// Add a member to a group
export const addMember = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.body;
		if (!userId)
			return next(new AppError("userId is required", 400, { userId: "Required" }));

		const group = await Group.findById(req.params.id);
		if (!group) return next(new AppError("Group not found", 404, { id: "Not found" }));

		if (group.members.length >= 8) {
			return next(new AppError("Group is already at maximum capacity (8 members)", 422, { members: "Max size reached" }));
		}

		// Check if user already in a group for this division
		const existing = await Group.findOne({ division: group.division, members: userId });
		if (existing)
			return next(new AppError("Student is already in a group for this division", 409, { userId: "Already in group" }));

		group.members.push(userId);
		await group.save();
		await group.populate("members", "name email");

		res.status(200).json({ status: "success", data: { group } });
	},
);

// Remove a member from a group
export const removeMember = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const group = await Group.findById(req.params.id);
		if (!group) return next(new AppError("Group not found", 404, { id: "Not found" }));

		const { userId } = req.params;
		const memberIndex = group.members.findIndex((m) => m.toString() === userId);

		if (memberIndex === -1)
			return next(new AppError("User is not a member of this group", 404, { userId: "Not in group" }));

		group.members.splice(memberIndex, 1);

		if (group.members.length < 2) {
			return next(new AppError("Removing this member would violate the minimum group size of 2", 422, { members: "Min size violation" }));
		}

		await group.save();

		res.status(200).json({ status: "success", message: "Member removed", data: { group } });
	},
);
