export const corsMiddleware = (req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin

  // List of allowed origins
  const allowedOrigins = [
    "https://emailbuilderfrontend-gsu2pgvj5-ninjabtk66-gmailcoms-projects.vercel.app",
    "http://localhost:3000",
  ]

  // Check if the origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    res.setHeader("Access-Control-Max-Age", "86400") // 24 hours
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  next()
}

