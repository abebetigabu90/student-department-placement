import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  //windowMs: 10 * 60 * 1000, // 10 minutes
  windowMs: 21 * 1000, // 16 seconds (for testing)
  max: 5,
  max: 5, // max attempts
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
