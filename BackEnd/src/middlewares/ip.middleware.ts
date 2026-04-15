import type { Request, Response, NextFunction } from "express";
import IpRange from "../models/ipRange.model.js";
import ipaddr from "ipaddr.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import env from "../config/env.js";

const ipToLong = (ip: string) => {
	const addr = ipaddr.parse(ip);
	const octets = addr.toByteArray();
	return octets.reduce((int, octet) => (int << 8) + octet, 0) >>> 0;
};

export const checkIPRange = catchAsync(
	async (req: Request, _res: Response, next: NextFunction) => {
		let clientIp = req.ip || req.socket.remoteAddress;
		if (clientIp?.includes("::ffff:")) clientIp = clientIp?.split("::ffff:")[1];

		const ranges = await IpRange.find({ isActive: true });
		const clientLong = ipToLong(clientIp!);

		const isAllowed = ranges.some((range) => {
			return (
				clientLong >= ipToLong(range.startIP) &&
				clientLong <= ipToLong(range.endIP)
			);
		});

		if (!isAllowed && env.NODE_ENV === "production") {
			return next(
				new AppError("Forbidden: Outside allowed network", 403, {
					ip: "Access denied from this IP",
				}),
			);
		}
		next();
	},
);
