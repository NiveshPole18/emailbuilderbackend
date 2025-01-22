export const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
  
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(err.errors).map((error) => error.message),
      })
    }
  
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
      })
    }
  
    if (err.name === "MulterError") {
      return res.status(400).json({
        message: "File upload error",
        error: err.message,
      })
    }
  
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    })
  }
  
  