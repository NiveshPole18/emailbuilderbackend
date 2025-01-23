import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  // Always allow OPTIONS requests
  if (req.method === "OPTIONS") {
    return next()
  }

  // Public routes that don't need authentication
  const publicRoutes = ["/auth/login", "/auth/register"]
  if (publicRoutes.includes(req.path)) {
    return next()
  }

  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("No token provided for path:", req.path)
      return res.status(401).json({
        message: "Authentication required",
        path: req.path,
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
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

