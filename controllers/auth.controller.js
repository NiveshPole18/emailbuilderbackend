import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const register = async (req, res) => {
  console.log("Registration attempt:", { ...req.body, password: "[REDACTED]" })

  try {
    const { email, password, name } = req.body

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          name: !name ? "Name is required" : null,
        },
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      })
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      name,
      email,
      password: hashedPassword,
    })

    await user.save()

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })

    console.log("Registration successful for:", email)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    })
  }
}

export const login = async (req, res) => {
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

