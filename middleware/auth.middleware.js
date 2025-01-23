import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      console.error("Token verification failed:", error)
      return res.status(401).json({
        message: "Invalid or expired token",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      message: "Server error",
    })
  }
}

