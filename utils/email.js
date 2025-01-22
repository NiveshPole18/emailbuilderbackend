import fs from "fs/promises"
import path from "path"
import Handlebars from "handlebars"

export const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(process.cwd(), "templates", `${templateName}.html`)
    const templateContent = await fs.readFile(templatePath, "utf-8")
    const template = Handlebars.compile(templateContent)
    return template(data)
  } catch (error) {
    throw new Error(`Error compiling template: ${error.message}`)
  }
}

