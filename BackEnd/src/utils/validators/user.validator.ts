import { z } from "zod";

export const membershipSchema = z.object({
  role: z.enum(["division_admin", "student"]),
  division: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid division ID format"),
});

export const createUserSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  email: z.string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .optional(),

  roles: z.array(z.enum(["super_admin", "division_admin", "student"]))
    .optional()
    .default(["student"]),

  memberships: z.array(membershipSchema)
    .optional()
    .default([]),

  status: z.enum(["active", "suspended", "graduated"])
    .optional()
    .default("active"),
}).superRefine((data, ctx) => {
  if (data.roles.includes("super_admin")) {
    if (data.memberships && data.memberships.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Super admin cannot have division memberships",
        path: ["memberships"],
      });
    }

    if (data.roles.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Super admin can only have the super_admin role",
        path: ["roles"],
      });
    }
  }

  if (data.roles.includes("division_admin")) {
    const hasDivisionAdminMembership = data.memberships?.some(
      m => m.role === "division_admin"
    );

    if (!hasDivisionAdminMembership) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "User with division_admin role must have at least one division_admin membership",
        path: ["memberships"],
      });
    }
  }

  if (data.memberships && data.memberships.length > 0) {
    const divisionIds = data.memberships.map(m => m.division);
    const uniqueDivisionIds = [...new Set(divisionIds)];

    if (divisionIds.length !== uniqueDivisionIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A user cannot have multiple memberships in the same division",
        path: ["memberships"],
      });
    }
  }
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
