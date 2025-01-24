import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { emailRoutes } from "./routes/email.routes.js"
import { authRoutes } from "./routes/auth.routes.js"
import { mkdir } from "fs/promises"

// Load env vars
dotenv.config()

// Initialize express
const app = express()

// Connect to database
connectDB()

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static folder
app.use("/uploads", express.static("uploads"))

// Mount routes
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)

// Error handler
app.use(errorHandler)

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  server.close(() => process.exit(1))
})

const PORT = process.env.PORT || 5000

async function startServer() {
  await mkdir("uploads").catch(() => {})
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()

