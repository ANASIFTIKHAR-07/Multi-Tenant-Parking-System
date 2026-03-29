import rateLimit from "express-rate-limit"

// Login limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 attempts
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
})

export {loginLimiter}