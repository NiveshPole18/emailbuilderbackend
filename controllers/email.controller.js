import fs from "fs/promises"
import path from "path"
import sharp from "sharp"
import { Template } from "../models/template.model.js"
import { compileTemplate } from "../utils/email.js"

export const getEmailLayout = async (req, res) => {
  try {
    const layoutPath = path.join(process.cwd(), "templates", "layout.html")
    const layout = await fs.readFile(layoutPath, "utf8")
    res.json({ layout })
  } catch (error) {
    console.error("Error reading layout:", error)
    res.status(500).json({ message: "Error reading layout", error: error.message })
  }
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    const optimizedImage = await sharp(req.file.path).resize(800).jpeg({ quality: 80 }).toBuffer()

    const optimizedPath = `uploads/${req.file.filename}.jpg`
    await sharp(optimizedImage).toFile(optimizedPath)

    // Delete original file
    await fs.unlink(req.file.path)

    res.json({
      imageUrl: `/${optimizedPath}`,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).json({ message: "Error uploading image", error: error.message })
  }
}

export const uploadEmailConfig = async (req, res) => {
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

    // Create and save template with default layout
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
}

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.userId }).sort({ createdAt: -1 }).select("-__v") // Exclude version key

    res.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    res.status(500).json({ message: "Error fetching templates", error: error.message })
  }
}

export const renderAndDownloadTemplate = async (req, res) => {
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
    const renderedHtml = await compileTemplate(layoutName, {
      ...template.config,
      title: template.config.title,
      imageUrl: template.config.imageUrl,
      styles: template.config.styles || {},
    })

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Disposition", `attachment; filename="template-${template._id}.html"`)
    res.send(renderedHtml)
  } catch (error) {
    console.error("Error rendering template:", error)
    res.status(500).json({ message: "Error rendering template", error: error.message })
  }
}

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    await Template.deleteOne({ _id: template._id })
    res.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting template:", error)
    res.status(500).json({ message: "Error deleting template", error: error.message })
  }
}

