import { Request, Response } from "express";
import User from "../models/user.model.js";
import Bootcamp from "../models/bootcamp.model.js";
import Notification from "../models/notification.model.js";
import { validateBootcamp } from "../utils/validators/bootcamp.validator.js";
import logger from "../utils/logger.js";

export const createBootcamp = async (req: Request, res: Response) => {
  const validationResult = validateBootcamp(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }

  const { name, description, duration, startDate, endDate, division , creator } = validationResult.data;

  try {
    const bootcamp = await Bootcamp.create({
      name,
      description,
      duration,
      startDate,
      endDate,
      division,
      creator,
    });

    const users = await User.find();

    await Notification.insertMany(
      users.map(user => ({
        user: user._id,
        message: `Bootcamp "${name}" created successfully!, you can enroll now!`,
        type: "general",
      }))
    );

    res.status(201).json(bootcamp);
  } catch (error) {
    logger.error("Error creating bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBootcamp = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
      res.status(404).json({ message: "Bootcamp not found" });
      return;
    }

    res.status(200).json(bootcamp);
  } catch (error) {
    logger.error("Error getting bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBootcamps = async (req: Request, res: Response) => {
  try {
    const bootcamps = await Bootcamp.find();

    res.status(200).json(bootcamps);
  } catch (error) {
    logger.error("Error getting bootcamps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBootcamp = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = validateBootcamp(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validationResult.error.issues.map(err => ({
        field: err.path.join("."),
        message: err.message
      }))
    });
  }

  const { name, description, duration, startDate, endDate, division } = validationResult.data;

  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { name, description, duration, startDate, endDate, division },
      { new: true }
    );

    res.status(200).json(bootcamp);
  } catch (error) {
    logger.error("Error updating bootcamp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
