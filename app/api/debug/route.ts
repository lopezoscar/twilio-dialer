import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Only allow this in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if all required environment variables are set
  const envVars = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "✓ Set" : "✗ Missing",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "✓ Set" : "✗ Missing",
    TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID
      ? "✓ Set"
      : "✗ Missing",
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
      ? "✓ Set"
      : "✗ Missing",
    TWILIO_API_KEY: process.env.TWILIO_API_KEY ? "✓ Set" : "✗ Missing",
    TWILIO_API_SECRET: process.env.TWILIO_API_SECRET ? "✓ Set" : "✗ Missing",
  };

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    envVars,
  });
}
