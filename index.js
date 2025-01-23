import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"

dotenv.config()

const app = express()

// Simple CORS configuration
app.use(
  cors({
    origin: "https://emailbuilderfrontend-pgr1u2ink-ninjabtk66-gmailcoms-projects.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)

// Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

