import { body, validationResult } from "express-validator"

export const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      })
    }
    next()
  },
]

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").trim().notEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      })
    }
    next()
  },
]

