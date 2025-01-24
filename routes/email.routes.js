import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { uploadMiddleware } from "../middleware/upload.middleware.js"
import {
  getTemplates,
  getTemplate,
  uploadEmailConfig,
  updateTemplate,
  deleteTemplate,
  uploadImage,
  renderTemplate,
} from "../controllers/email.controller.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Template routes
router.get("/templates", getTemplates)
router.get("/template/:id", getTemplate)
router.get("/template/:id/render", renderTemplate) // Add this route
router.post("/template", uploadEmailConfig)
router.put("/template/:id", updateTemplate)
router.delete("/template/:id", deleteTemplate)

// Image upload route
router.post("/upload-image", uploadMiddleware, uploadImage)

export { router as emailRoutes }

