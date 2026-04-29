import z from "zod";
import { ISession } from "../../types/types.js";

const sessionSchema = z.object({
  title: z.string().min(3).max(50).trim(),
  description: z.string().min(3).max(500).trim(),

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),

  instructor: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  division: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const validateSession = (session: ISession) => {
  return sessionSchema.safeParse(session);
};
