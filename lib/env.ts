import { z } from "zod"

// Define the schema for environment variables
const envSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1, "TWILIO_ACCOUNT_SID is required"),
  TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),
  TWILIO_TWIML_APP_SID: z.string().min(1, "TWILIO_TWIML_APP_SID is required"),
  TWILIO_PHONE_NUMBER: z.string().min(1, "TWILIO_PHONE_NUMBER is required"),
  TWILIO_API_KEY: z.string().optional(),
  TWILIO_API_SECRET: z.string().optional(),
})

// Function to validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      TWILIO_API_KEY: process.env.TWILIO_API_KEY,
      TWILIO_API_SECRET: process.env.TWILIO_API_SECRET,
    })
  } catch (error) {
    console.error("❌ Invalid environment variables:", error)
    throw new Error("Invalid environment variables")
  }
}

export const env = validateEnv()

// Helper function to check if API key and secret are available
export function hasApiCredentials() {
  return Boolean(env.TWILIO_API_KEY && env.TWILIO_API_SECRET)
}
