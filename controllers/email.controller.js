import { Template } from "../models/template.model.js"
import sharp from "sharp"
import path from "path"
import fs from "fs/promises"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

    const originalPath = req.file.path
    const filename = req.file.filename
    const outputFilename = `optimized-${filename}`
    const outputPath = path.join(__dirname, "../uploads", outputFilename)

    // Ensure uploads directory exists
    await fs.mkdir(path.join(__dirname, "../uploads")).catch(() => {})

    // Optimize image
    await sharp(originalPath)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toFile(outputPath)

    // Delete original file
    await fs.unlink(originalPath).catch(console.error)

    // Return the URL for the optimized image
    const imageUrl = `/uploads/${outputFilename}`

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

export const renderTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    // Generate HTML using the template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.config.title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: ${template.config.styles.backgroundColor};
            color: ${template.config.styles.contentColor};
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
          }
          .header h1 {
            color: ${template.config.styles.titleColor};
            font-size: ${template.config.styles.fontSize};
            margin: 0;
          }
          .content {
            padding: 20px 0;
          }
          .image {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            display: block;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${template.config.title}</h1>
          </div>
          
          ${
            template.config.imageUrl
              ? `
            <img src="${template.config.imageUrl}" alt="Email content" class="image">
          `
              : ""
          }
          
          <div class="content">
            ${template.config.content}
          </div>
          
          <div class="footer">
            ${template.config.footer}
          </div>
        </div>
      </body>
      </html>
    `

    // Set headers for file download
    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Disposition", `attachment; filename="template-${template._id}.html"`)

    // Send the rendered HTML
    res.send(html)
  } catch (error) {
    console.error("Error rendering template:", error)
    res.status(500).json({
      message: "Error rendering template",
      error: error.message,
    })
  }
}

