import type { Request, Response, NextFunction } from "express";
import Resource from "../models/resource.model.js";
import AppError from "../utils/appError.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export const createResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    
    // Handle Cloudinary file upload
    if (req.file) {
      // Cloudinary stores file info differently than local storage
      const fileUrl = (req.file as any).path; // Cloudinary URL
      const publicId = (req.file as any).filename; // Cloudinary public ID
      
      data.fileUrl = fileUrl;
      data.publicId = publicId; // Store public ID for later deletion
    }

    const resource = await Resource.create({
      ...data,
      uploadedBy: req.user!._id,
    });
    
    res.status(201).json({ status: "success", data: { resource } });
  } catch (error) {
    next(error);
  }
}

export const getAllResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session, bootcamp, type } = req.query;
    const filter: Record<string, any> = {};

    if (session) filter.session = session;
    if (bootcamp) filter.bootcamp = bootcamp;
    if (type) filter.type = type;

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "name email")
      .populate("session", "title startTime")
      .populate("bootcamp", "name")
      .sort("-createdAt");

    // Add purpose context to each resource
    const resourcesWithContext = resources.map((resource) => ({
      ...resource.toObject(),
      purpose: resource.session ? "session-specific" : "bootcamp-general",
      context: resource.session
        ? `Uploaded for session: ${(resource.session as any).title}`
        : `Uploaded for bootcamp: ${(resource.bootcamp as any).name}`,
    }));

    res.status(200).json({
      status: "success",
      results: resourcesWithContext.length,
      data: { resources: resourcesWithContext },
    });
  } catch (error) {
    next(error);
  }
}

export const getResourceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .populate("session", "title startTime")
      .populate("bootcamp", "name");

    if (!resource)
      return next(new AppError("Resource not found", 404, { id: "Not found" }));

    // Add purpose context
    const resourceWithContext = {
      ...resource.toObject(),
      purpose: resource.session ? "session-specific" : "bootcamp-general",
      context: resource.session
        ? `Uploaded for session: ${(resource.session as any).title}`
        : `Uploaded for bootcamp: ${(resource.bootcamp as any).name}`,
    };

    res.status(200).json({ status: "success", data: { resource: resourceWithContext } });
  } catch (error) {
    next(error);
  }
}

export const deleteResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource)
      return next(new AppError("Resource not found", 404, { id: "Not found" }));

    // Delete file from Cloudinary if it exists
    if (resource.publicId) {
      try {
        await deleteFromCloudinary(resource.publicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        // Continue with resource deletion even if Cloudinary delete fails
      }
    }

    await resource.deleteOne();

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
}

// Increment download counter and return the download URL
export const trackDownload = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
}