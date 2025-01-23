import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"

dotenv.config()

const app = express()

// CORS configuration
const corsOptions = {
  origin: [
    "https://emailbuilderfrontend-8w2h9esd3-ninjabtk66-gmailcoms-projects.vercel.app",
    "http://localhost:3000", // For local development
    "https://emailbuilderfrontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
}

// Apply CORS middleware
app.use(cors(corsOptions))

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))

// Pre-flight OPTIONS handler
app.options("*", cors(corsOptions))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)

// Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

