import type { Request, Response, NextFunction } from "express";
import Resource from "../models/resource.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const createResource = catchAsync(async (req: Request, res: Response) => {
	const resource = await Resource.create({
		...req.body,
		uploadedBy: req.user!._id,
	});
	res.status(201).json({ status: "success", data: { resource } });
});

export const getAllResources = catchAsync(async (req: Request, res: Response) => {
	const { session, type } = req.query;
	const filter: Record<string, any> = {};

	if (session) filter.session = session;
	if (type) filter.type = type;

	const resources = await Resource.find(filter)
		.populate("uploadedBy", "name")
		.populate("session", "title startTime")
		.sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: resources.length,
		data: { resources },
	});
});

export const getResourceById = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const resource = await Resource.findById(req.params.id)
			.populate("uploadedBy", "name")
			.populate("session", "title startTime");

		if (!resource)
			return next(new AppError("Resource not found", 404, { id: "Not found" }));

		res.status(200).json({ status: "success", data: { resource } });
	},
);

export const deleteResource = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const resource = await Resource.findByIdAndDelete(req.params.id);
		if (!resource)
			return next(new AppError("Resource not found", 404, { id: "Not found" }));

		res.status(204).json({ status: "success", data: null });
	},
);

// Increment download counter and return the download URL
export const trackDownload = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const resource = await Resource.findByIdAndUpdate(
			req.params.id,
			{ $inc: { downloads: 1 } },
			{ new: true },
		);

		if (!resource)
			return next(new AppError("Resource not found", 404, { id: "Not found" }));

		res.status(200).json({
			status: "success",
			data: {
				downloadUrl: resource.fileUrl || resource.externalLink,
				downloads: resource.downloads,
			},
		});
	},
);
