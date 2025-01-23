import express from "express"
import { register, login, getMe } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { validateRegistration, validateLogin } from "../middleware/validation.middleware.js"

const router = express.Router()

// Public routes
router.post("/register", validateRegistration, register)
router.post("/login", validateLogin, login)

// Protected routes
router.get("/me", authMiddleware, getMe)

// Debug route
router.get("/register", (req, res) => {
  res.status(405).json({
    message: "Method not allowed. Please use POST for registration.",
    allowedMethods: ["POST"],
  })
})

export { router as authRoutes }

