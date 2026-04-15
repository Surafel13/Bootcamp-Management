import type { Request, Response, NextFunction } from 'express';
import Session from '../models/session.model.js';
import catchAsync from '../utils/catchAsync.js'; // Assuming you use a wrapper for async errors

export const createSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { division, startTime, endTime } = req.body ;

  const start = new Date(startTime);
  const end = new Date(endTime);

  // 1. Check for overlapping sessions
  const overlapping = await Session.findOne({
    division: division,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } } 
      // Improved logic: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    ]
  });

  if (overlapping) {
    return res.status(400).json({
      status: 'fail',
      message: 'A session already exists in this time slot for this division.'
    });
  }

  // 2. Check for minimum duration (30 mins)
   const duration = (end.getTime() - start.getTime()) / (1000 * 60); 

  if (duration < 30) {
    return res.status(400).json({ message: 'Session must be at least 30 minutes long.' });
  }

  // 3. Create session
  const newSession = await Session.create(req.body);

  res.status(201).json({ status: 'success', data: newSession });
  next();
});
