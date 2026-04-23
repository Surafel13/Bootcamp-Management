import type { Request, Response, NextFunction } from "express";

const catchAsync =
	(fn: Function) =>
		(req: Request, res: Response, next: NextFunction): void => {
			fn(req, res, next).catch(next);
		};

export default catchAsync;
