import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return next()
  }

  // Public routes that don't need authentication
  const publicRoutes = ["/auth/login", "/auth/register"]
  if (publicRoutes.includes(req.path)) {
    return next()
  }

  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]

    // Check if no token
    if (!token) {
      return res.status(401).json({
        message: "No authentication token, authorization denied",
        code: "NO_TOKEN",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Add user from payload
      req.user = decoded

      next()
    } catch (err) {
      console.error("Token verification failed:", err)

      return res.status(401).json({
        message: "Token is not valid",
        code: "INVALID_TOKEN",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
  } catch (err) {
    console.error("Auth middleware error:", err)

    return res.status(500).json({
      message: "Server Error",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
}

