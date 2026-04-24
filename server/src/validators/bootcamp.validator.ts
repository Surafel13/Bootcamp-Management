import z from "zod";
import { IBootcamp , IInstructorAssignment } from "../types/types.js";

const bootcampSchema = z.object({
  name: z.string().min(3).max(50).trim(),
  description: z.string().min(3).max(500).trim(),
  duration: z.string().min(3).max(50).trim(),

  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  enrollmentDeadline: z.coerce.date(),

  instructor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  division: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  creator: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine(data => data.enrollmentDeadline <= data.startDate, {
  message: "Enrollment deadline must be before or equal to start date",
  path: ["enrollmentDeadline"],
});

const instructorAssignmentSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  assignedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  permissions: z.array(z.string().min(1).max(50).trim()).nonempty(),
  instructor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});

export const validateInstructorAssignment = (instructorAssignment: IInstructorAssignment) => {
  return instructorAssignmentSchema.safeParse(instructorAssignment);
};

export const validateBootcamp = (bootcamp: IBootcamp) => {
  return bootcampSchema.safeParse(bootcamp);
};