import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"
import { corsMiddleware } from "./middleware/cors.middleware.js"

dotenv.config()

const app = express()

// Apply CORS middleware before any other middleware
app.use(corsMiddleware)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
app.use("/uploads", express.static("uploads"))

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)

// Error handling
app.use(errorHandler)

// Catch-all route handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 404,
  })
})

const PORT = process.env.PORT || 5000

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log("CORS enabled for:", process.env.CORS_ORIGIN)
  // Connect to database after server starts
  connectDB()
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  process.exit(1)
})

