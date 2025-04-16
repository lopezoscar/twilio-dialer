import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    // Get environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    // Log environment variables (without exposing sensitive data)
    console.log("Simple Token API - Environment variables check:", {
      hasAccountSid: Boolean(accountSid),
      hasAuthToken: Boolean(authToken),
      hasTwimlAppSid: Boolean(twimlAppSid),
    });

    // Check if required variables are set
    if (!accountSid || !authToken || !twimlAppSid) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          accountSid: Boolean(accountSid),
          authToken: Boolean(authToken),
          twimlAppSid: Boolean(twimlAppSid),
        },
        { status: 500 }
      );
    }

    // Create a capability token (older method but simpler)
    const capability = new twilio.jwt.ClientCapability({
      accountSid,
      authToken,
    });

    // Allow outgoing calls
    capability.addScope(
      new twilio.jwt.ClientCapability.OutgoingClientScope({
        applicationSid: twimlAppSid,
      })
    );

    // Generate the token
    const token = capability.toJwt();

    // Return the token
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating simple token:", error);
    return NextResponse.json(
      {
        error: "Failed to generate token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
