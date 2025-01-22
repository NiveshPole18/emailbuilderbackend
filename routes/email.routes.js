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
import { Router } from "express"
import { Template } from "../models/template.model.js"
import { compileTemplate } from "../utils/email.js"

const router = Router()

// Protect all routes
router.use(authMiddleware)

router.get("/layout", getEmailLayout)
router.post("/upload-image", uploadMiddleware, uploadImage)
router.post("/template", uploadEmailConfig)
router.get("/template/:id/render", renderAndDownloadTemplate)
router.get("/templates", getTemplates)
router.delete("/template/:id", deleteTemplate)

// Add the download route here
router.get("/template/:id/download", async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    // Use the template's layout or fall back to default
    const layoutName = template.layout || "default"
    const renderedHtml = await compileTemplate(layoutName, template.config)

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Disposition", `attachment; filename="template-${template._id}.html"`)
    res.send(renderedHtml)
  } catch (error) {
    console.error("Error downloading template:", error)
    res.status(500).json({ message: "Error downloading template", error: error.message })
  }
})

// Template routes
router.post("/templates", async (req, res) => {
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
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Error fetching template", error: error.message });
  }
});

export const emailRoutes = router

