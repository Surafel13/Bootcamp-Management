import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";
import type { IUser } from "../types/types.js";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
  role: string;
  divisionId?: string;
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return next(
        new AppError("Please log in to access this route", 401, {
          auth: "Authentication required",
        }),
      );

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await User.findById(decoded.id)
      .populate("memberships.division", "name code description");

    if (!user)
      return next(
        new AppError("User no longer exists", 401, {
          user: "Invalid user",
        }),
      );

    if (user.status === "suspended")
      return next(
        new AppError("Your account has been suspended", 403, {
          status: "Account suspended",
        }),
      );

    if (user.status === "graduated")
      return next(
        new AppError("Your account is no longer active", 403, {
          status: "Account graduated",
        }),
      );

    // Validate the token's claimed role still exists on the user
    if (!decoded.role) {
      return next(
        new AppError("Your session is outdated, please log in again", 401, {
          role: "Token missing role context",
        }),
      );
    }

    if (!user.roles.includes(decoded.role as any) && !user.memberships.find(m => m.role === decoded.role)) {
      return next(
        new AppError("Your session role is no longer valid, please log in again", 401, {
          role: "Role mismatch",
        }),
      );
    }

    if (decoded.divisionId && decoded.role !== "super_admin") {
      const stillMember = user.isInDivision(decoded.divisionId);
      if (!stillMember) {
        return next(
          new AppError("Your division access has been revoked, please log in again", 403, {
            division: "Division membership revoked",
          }),
        );
      }
    }

    req.user = user;
    req.activeRole = decoded.role;
    req.activeDivisionId = decoded.divisionId ?? null;

    next();
  }

export const restrictTo = (...allowedRoles: IUser["roles"][number][]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const activeRole = req.activeRole;

    if (activeRole === "super_admin") return next();

    if (!activeRole || !allowedRoles.includes(activeRole as any)) {
      return next(
        new AppError("You do not have permission for this action", 403, {
          role: "Insufficient permissions",
          activeRole,
        }),
      );
    }

    next();
  };
};

export const restrictToDivision = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const divisionId = req.params?.divisionId || req.body?.divisionId || req.query?.divisionId;

  if (req.activeRole === "super_admin") {
    return next();
  }

  if (!req.activeDivisionId) {
    return next(
      new AppError("No division context in your session", 403, {
        division: "Division context required",
      }),
    );
  }

  if (divisionId && req.activeDivisionId !== divisionId.toString()) {
    return next(
      new AppError("You do not have access to this division", 403, {
        division: "Division access denied",
      }),
    );
  }

  next();
};
