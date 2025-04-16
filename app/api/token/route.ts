import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    // Check if environment variables are set
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

    // Log environment variables (without exposing sensitive data)
    console.log("Token API - Environment variables check:", {
      hasAccountSid: Boolean(accountSid),
      hasAuthToken: Boolean(authToken),
      hasTwimlAppSid: Boolean(twimlAppSid),
    });

    if (!accountSid) {
      return NextResponse.json(
        { error: "TWILIO_ACCOUNT_SID is not set" },
        { status: 500 }
      );
    }

    if (!authToken) {
      return NextResponse.json(
        { error: "TWILIO_AUTH_TOKEN is not set" },
        { status: 500 }
      );
    }

    if (!twimlAppSid) {
      return NextResponse.json(
        { error: "TWILIO_TWIML_APP_SID is not set" },
        { status: 500 }
      );
    }

    // Create a capability token (simpler approach)
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
    console.error("Error generating token:", error);
    return NextResponse.json(
      {
        error: "Failed to generate token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
