export const corsMiddleware = (req, res, next) => {
    const allowedOrigins = [
      "https://emailbuilderfrontend-8w2h9esd3-ninjabtk66-gmailcoms-projects.vercel.app",
      "http://localhost:3000",
      "https://emailbuilderfrontend.vercel.app"
    ]
  
    const origin = req.headers.origin
  
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin)
    }
  
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  
    res.setHeader("Access-Control-Allow-Credentials", "true")
  
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end()
    }
  
    next()
  }
  
  