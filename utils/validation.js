import { body } from "express-validator"

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

export const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
]

export const templateValidation = [
  body("name").trim().notEmpty().withMessage("Template name is required"),
  body("config.title").trim().notEmpty().withMessage("Title is required"),
  body("config.content").trim().notEmpty().withMessage("Content is required"),
]

