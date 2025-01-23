import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"

dotenv.config()

const app = express()

// Updated CORS configuration with new frontend URL
const allowedOrigins = [
  "https://emailbuilderfrontend-gjbilk7h5-ninjabtk66-gmailcoms-projects.vercel.app",
  "https://emailbuilderfrontend-8w2h9esd3-ninjabtk66-gmailcoms-projects.vercel.app",
  "http://localhost:3000",
  "https://emailbuilderfrontend.vercel.app"
]

// Apply CORS middleware before routes
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin."
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
)

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
  // Connect to database after server starts
  connectDB()
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  process.exit(1)
})

