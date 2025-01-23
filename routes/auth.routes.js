import express from "express"
import { register, login, getMe } from "../controllers/auth.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)

// Protected routes
router.get("/me", authMiddleware, getMe)

export { router as authRoutes }

