import type { Request, Response, NextFunction } from "express";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import { signToken } from "../utils/jwt.js";
import { sendPasswordResetEmail } from "../queues/email.queue.js";

export const login =
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role, divisionId } = req.body;

    if (!email || !password)
      return next(
        new AppError("Please provide email and password", 400, {
          email: "Email is required",
          password: "Password is required",
        }),
      );

    const user = await User.findOne({ email })
      .select("+password")
      .populate("memberships.division", "name code description");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(
        new AppError("Incorrect email or password", 401, {
          credentials: "Invalid email or password",
        }),
      );
    }

    if (user.status === "suspended") {
      return next(
        new AppError("Your account has been suspended", 403, {
          status: "Account suspended",
        }),
      );
    }

    let activeRole: string;
    let activeDivision: string | null = null;

    const getDivisionId = (division: any): string =>
      (division?._id ?? division)?.toString();

    if (role && divisionId) {
      const membership = user.memberships.find(
        (m: any) =>
          getDivisionId(m.division) === divisionId.toString() && // ✅ was m.division.toString()
          m.role === role,
      );

      if (!membership) {
        return next(
          new AppError("You do not have this role in the specified division", 403, {
            role: "Invalid role or division",
          }),
        );
      }

      if (role === "super_admin") {
        return next(
          new AppError("Super admin does not belong to a division", 400, {
            role: "Invalid role for division-scoped login",
          }),
        );
      }

      activeRole = role;
      activeDivision = divisionId;
    } else {
      const rolePriority = ["super_admin", "division_admin", "student"] as const;
      activeRole = rolePriority.find((r) => user.roles.includes(r)) ?? "student";

      if (activeRole !== "super_admin") {
        const primaryMembership = user.memberships.find(
          (m: any) => m.role === activeRole,
        );
        // Default role path
        activeDivision = primaryMembership
          ? getDivisionId(primaryMembership.division)
          : null;
      }
    }

    const payload = {
      id: user._id.toString(),
      role: activeRole,
      ...(activeDivision && { divisionId: activeDivision }),
    };

    const accessToken = signToken(payload, env.JWT_SECRET, "24h");
    const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, "7d");

    if (!user.firstLogin) {
      await User.updateOne({ _id: user._id }, { firstLogin: true });
      const changePasswordURL = `${env.FRONTEND_URL}/change-password`;
      await Notification.create({
        user: user._id,
        message: `Welcome to CSEC! You're now a member of the CSEC community. Please change your default password: ${changePasswordURL}`,
        type: "general",
      });
    }

    res.status(200).json({
      status: "success",
      accessToken,
      refreshToken,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          memberships: user.memberships,
          status: user.status,
          activeRole,
          activeDivision,
        },
      },
    });
  }

export const forgotPassword =
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email)
      return next(new AppError("Please provide your email address", 400, { email: "Required" }));

    const user = await User.findOne({ email });
    if (!user)
      return next(new AppError("No user found with that email address", 404, { email: "Not found" }));

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken.toString()).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });


    try {
      await sendPasswordResetEmail(user.name, user.email, resetToken);

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to email",
      });
    } catch {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("Failed to send email. Please try again later.", 500, {}));
    }
  }

export const validateResetPasswordToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  if (!token) {
    throw new AppError("Token is required", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(token.toString()).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password");

  if (!user)
    return next(new AppError("Token is invalid or has expired", 400, { token: "Invalid or expired" }));

  res.status(200).json({
    status: "success",
    data: { user },
  });
}

export const resetPassword =
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return next(new AppError("Please provide a new password", 400, { password: "Required" }));

    if (!token) {
      throw new AppError("Token is required", 400);
    }
    const hashedToken = crypto.createHash("sha256").update(token.toString()).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user)
      return next(new AppError("Token is invalid or has expired", 400, { token: "Invalid or expired" }));

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const payload = {
      id: user._id.toString(),
      role: req.activeRole!,
      ...(req.activeDivisionId && { divisionId: req.activeDivisionId }),
    };

    const accessToken = signToken(payload, env.JWT_SECRET, "24h");
    const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, "7d");

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
      accessToken,
      refreshToken,
    });
  }

export const changePassword =
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const { password } = req.body;
    if (!password)
      return next(new AppError("Please provide a new password", 400, { password: "Required" }));

    if (!token) {
      throw new AppError("Token is required", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token.toString()).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user)
      return next(new AppError("Token is invalid or has expired", 400, { token: "Invalid or expired" }));

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const payload = {
      id: user._id.toString(),
      role: req.activeRole!,
      ...(req.activeDivisionId && { divisionId: req.activeDivisionId }),
    };

    const accessToken = signToken(payload, env.JWT_SECRET, "24h");
    const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, "7d");

    res.status(200).json({
      status: "success",
      message: "Password reset successful",
      accessToken,
      refreshToken,
    });
  }

export const switchRole =
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, divisionId } = req.body;
    const user = req.user!;

    // Helper to extract division ID from either populated object or raw ObjectId
    const getDivisionId = (division: any): string =>
      (division?._id ?? division)?.toString();

    // Check if user has this role (either in roles array or memberships)
    if (!user.roles.includes(role) && !user.memberships.find(m => m.role === role)) {
      return next(new AppError("You do not have this role", 403, { role: "Invalid role" }));
    }

    let activeDivision: string | null = null;

    if (role === "super_admin") {
      // Super admin has no division context
      activeDivision = null;
    } else {
      // For division-scoped roles, find the matching membership
      const membership = user.memberships.find((m: any) => {
        if (m.role !== role) return false;
        if (!divisionId) return true; // Match first membership for this role
        return getDivisionId(m.division) === divisionId.toString();
      });

      if (!membership) {
        return next(new AppError("Invalid role/division combination", 403, { role: "No matching membership" }));
      }

      // Extract division ID as string (handles both populated and non-populated)
      activeDivision = getDivisionId(membership.division);
    }

    const payload = {
      id: user._id.toString(),
      role,
      ...(activeDivision && { divisionId: activeDivision }),
    };

    res.status(200).json({
      status: "success",
      accessToken: signToken(payload, env.JWT_SECRET, "24h"),
      refreshToken: signToken(payload, env.JWT_REFRESH_SECRET, "7d"),
      data: { activeRole: role, activeDivision },
    });
  }

export const logout =
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ status: "success", message: "Logged out successfully" });
  }
