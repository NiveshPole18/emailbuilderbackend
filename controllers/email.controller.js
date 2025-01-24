import { Template } from "../models/template.model.js"
import sharp from "sharp"
import path from "path"
import fs from "fs/promises"

export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.userId }).sort({ createdAt: -1 }).select("-__v")

    res.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    res.status(500).json({
      message: "Error fetching templates",
      error: error.message,
    })
  }
}

export const getTemplate = async (req, res) => {
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
    res.status(500).json({
      message: "Error fetching template",
      error: error.message,
    })
  }
}

export const uploadEmailConfig = async (req, res) => {
  try {
    const { name, config } = req.body

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { name: "Template name is required" },
      })
    }

    if (!config?.title?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { title: "Template title is required" },
      })
    }

    if (!config?.content?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { content: "Template content is required" },
      })
    }

    // Create new template with default values for optional fields
    const template = new Template({
      userId: req.user.userId,
      name: name.trim(),
      config: {
        title: config.title.trim(),
        content: config.content.trim(),
        imageUrl: config.imageUrl || "",
        footer: config.footer || "",
        styles: {
          titleColor: config.styles?.titleColor || "#000000",
          contentColor: config.styles?.contentColor || "#333333",
          backgroundColor: config.styles?.backgroundColor || "#ffffff",
          fontSize: config.styles?.fontSize || "16px",
        },
      },
    })

    const savedTemplate = await template.save()
    res.status(201).json(savedTemplate)
  } catch (error) {
    console.error("Error creating template:", error)
    res.status(500).json({
      message: "Error creating template",
      error: error.message,
    })
  }
}

export const updateTemplate = async (req, res) => {
  try {
    const { name, config } = req.body

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { name: "Template name is required" },
      })
    }

    if (!config?.title?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { title: "Template title is required" },
      })
    }

    if (!config?.content?.trim()) {
      return res.status(400).json({
        message: "Validation failed",
        details: { content: "Template content is required" },
      })
    }

    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        name: name.trim(),
        config: {
          title: config.title.trim(),
          content: config.content.trim(),
          imageUrl: config.imageUrl || "",
          footer: config.footer || "",
          styles: {
            titleColor: config.styles?.titleColor || "#000000",
            contentColor: config.styles?.contentColor || "#333333",
            backgroundColor: config.styles?.backgroundColor || "#ffffff",
            fontSize: config.styles?.fontSize || "16px",
          },
        },
      },
      { new: true, runValidators: true },
    )

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.json(template)
  } catch (error) {
    console.error("Error updating template:", error)
    res.status(500).json({
      message: "Error updating template",
      error: error.message,
    })
  }
}

export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    res.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting template:", error)
    res.status(500).json({
      message: "Error deleting template",
      error: error.message,
    })
  }
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Get the file path
    const filePath = req.file.path
    const fileName = req.file.filename

    // Optimize the image
    await sharp(filePath)
      .resize(800, null, {
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toFile(path.join("uploads", `optimized-${fileName}`))

    // Delete the original file
    await fs.unlink(filePath)

    // Return the optimized image URL
    const imageUrl = `/uploads/optimized-${fileName}`

    res.json({
      url: imageUrl,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).json({
      message: "Error uploading image",
      error: error.message,
    })
  }
}

