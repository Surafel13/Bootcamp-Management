import type { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import  logger  from "../utils/logger.js"
import  AppError from "../utils/appError.js"

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Error: ${err}`)

  let statusCode = 500
  let message = "Something went wrong"
  let errors: any = {}

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    errors = err.errors
  }

  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    message = "Validation error"

    errors = Object.keys(err.errors).reduce((acc: any, key) => {
      acc[key] = err.errors[key].message
      return acc
    }, {})
  }

  else if (err.code === 11000) {
    statusCode = 409
    message = "Duplicate field value entered"

    errors = {
      fields: Object.keys(err.keyValue),
    }
  }

  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  else if (err.name === "DocumentNotFoundError") {
    statusCode = 404
    message = "Record not found"
  }

  res.status(statusCode).json({
    status: "error",
    message,
    errors: Object.keys(errors ?? {}).length ? errors : undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}
