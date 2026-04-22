import z from "zod";
import { IBootcamp } from "../../types/types.js";

const bootcampSchema = z.object({
  name: z.string().min(3).max(50).trim(),
  description: z.string().min(3).max(500).trim(),
  duration: z.string().min(3).max(50).trim(),

  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  division: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  creator: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const validateBootcamp = (bootcamp: IBootcamp) => {
  return bootcampSchema.safeParse(bootcamp);
};
