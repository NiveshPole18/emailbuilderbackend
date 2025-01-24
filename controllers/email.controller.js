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

    const template = new Template({
      name: name.trim(),
      config,
      userId: req.user.userId,
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
    const template = await Template.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, {
      new: true,
    })

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

    const filename = `${Date.now()}-${path.basename(req.file.originalname)}`
    const outputPath = path.join("uploads", filename)

    // Optimize and save image
    await sharp(req.file.buffer)
      .resize(800) // max width
      .jpeg({ quality: 80 })
      .toFile(outputPath)

    // Return the image URL
    res.json({
      url: `/uploads/${filename}`,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.status(500).json({
      message: "Error uploading image",
      error: error.message,
    })
  }
}

