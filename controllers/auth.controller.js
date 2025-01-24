import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const register = async (req, res) => {
  try {
    console.log("Registration attempt with data:", { ...req.body, password: "[REDACTED]" })

    const { name, email, password } = req.body

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    })

    // Save user to database
    const savedUser = await user.save()
    console.log("User saved successfully:", savedUser._id)

    // Generate JWT token
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET || "fallback-secret-key", {
      expiresIn: "24h",
    })

    // Send success response
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export const login = async (req, res) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  console.log("Login attempt:", { email: req.body.email })

  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
        },
      })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    console.log("Login successful for:", email)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("Get me error:", error)
    res.status(500).json({
      message: "Error fetching user data",
      error: error.message,
    })
  }
}

