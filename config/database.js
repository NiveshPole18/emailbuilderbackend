import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/emailbuilder", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Handle database connection errors
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected")
    })

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      process.exit(0)
    })
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

