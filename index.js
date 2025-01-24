import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"

dotenv.config()

const app = express()

// Enable CORS for all origins
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
)

// Pre-flight requests
app.options("*", cors())

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
  console.log("CORS enabled for all origins")
})

