import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { uploadMiddleware } from "../middleware/upload.middleware.js"
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadImage,
} from "../controllers/email.controller.js"

const router = express.Router()

// Template routes
router.get("/templates", authMiddleware, getTemplates)
router.get("/template/:id", authMiddleware, getTemplate)
router.post("/template", authMiddleware, createTemplate)
router.put("/template/:id", authMiddleware, updateTemplate)
router.delete("/template/:id", authMiddleware, deleteTemplate)

// Upload route
router.post("/upload", authMiddleware, uploadMiddleware, uploadImage)

export { router as emailRoutes }

