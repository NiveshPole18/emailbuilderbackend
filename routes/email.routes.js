import express from "express"
import {
  getEmailLayout,
  uploadImage,
  uploadEmailConfig,
  renderAndDownloadTemplate,
  getTemplates,
  deleteTemplate,
} from "../controllers/email.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { uploadMiddleware } from "../middleware/upload.middleware.js"
import { corsMiddleware } from "../middleware/cors.middleware.js"
import { Template } from "../models/template.model.js"
import { compileTemplate } from "../utils/email.js"

const router = express.Router()

// Apply middlewares
router.use(corsMiddleware)
router.use(authMiddleware)

// Template CRUD operations
router.get("/templates", getTemplates)

router.post("/template", async (req, res) => {
  try {
    const { name, config } = req.body

    // Validate required fields
    const errors = {}
    if (!name?.trim()) errors.name = "Template name is required"
    if (!config?.title?.trim()) errors.title = "Template title is required"
    if (!config?.content?.trim()) errors.content = "Template content is required"

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        details: errors,
      })
    }

    // Create and save template
    const template = new Template({
      name: name.trim(),
      config,
      userId: req.user.userId,
      layout: "default", // Set default layout
    })

    const savedTemplate = await template.save()
    console.log("Template saved successfully:", savedTemplate._id)

    res.status(201).json(savedTemplate)
  } catch (error) {
    console.error("Error saving template:", error)
    res.status(500).json({
      message: "Error saving template",
      error: error.message,
    })
  }
})

router.get("/template/:id", async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.json(template)
  } catch (error) {
    console.error("Error fetching template:", error)
    res.status(500).json({ message: "Error fetching template", error: error.message })
  }
})

router.put("/template/:id", async (req, res) => {
  try {
    const { name, config } = req.body

    // Validate required fields
    const errors = {}
    if (!name?.trim()) errors.name = "Template name is required"
    if (!config?.title?.trim()) errors.title = "Template title is required"
    if (!config?.content?.trim()) errors.content = "Template content is required"

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        details: errors,
      })
    }

    const updatedTemplate = await Template.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      {
        name: name.trim(),
        config,
      },
      { new: true }
    )

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.json(updatedTemplate)
  } catch (error) {
    console.error("Error updating template:", error)
    res.status(500).json({ message: "Error updating template", error: error.message })
  }
})

router.delete("/template/:id", deleteTemplate)

// Template rendering and download
router.get("/template/:id/render", renderAndDownloadTemplate)

router.get("/template/:id/download", async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    const layoutName = template.layout || "default"
    const renderedHtml = await compileTemplate(layoutName, template.config)

    res.setHeader("Content-Type", "text/html")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="template-${template._id}.html"`
    )
    res.send(renderedHtml)
  } catch (error) {
    console.error("Error downloading template:", error)
    res.status(500).json({ message: "Error downloading template", error: error.message })
  }
})

// Image upload
router.post("/upload-image", uploadMiddleware, uploadImage)

// Layout
router.get("/layout", getEmailLayout)

export { router as emailRoutes }