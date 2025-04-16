import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  try {
    // Get form data from the request
    const formData = await req.formData();
    const searchParams = req.nextUrl.searchParams;

    // Create XML response
    const twiml = new VoiceResponse();

    // Get the phone number from the request
    const to = formData.get("To") || searchParams.get("To");

    if (to) {
      // Use the TWILIO_PHONE_NUMBER as the caller ID
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!phoneNumber) {
        throw new Error("TWILIO_PHONE_NUMBER is not set");
      }

      const dial = twiml.dial({ callerId: phoneNumber });

      // Clean up the phone number (remove spaces, etc.)
      const cleanedNumber = to.toString().replace(/\s+/g, "");
      dial.number(cleanedNumber);

      // Add a status callback URL
      const origin = req.headers.get("origin");
      if (origin) {
        dial.setAttribute(
          "statusCallbackEvent",
          "initiated ringing answered completed"
        );
        dial.setAttribute("statusCallback", `${origin}/api/status-callback`);
        dial.setAttribute("statusCallbackMethod", "POST");
      }
    } else {
      twiml.say("Thanks for calling!");
    }

    // Send the TwiML response
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error generating TwiML:", error);

    // If there's an error, still return valid XML
    const twiml = new VoiceResponse();
    twiml.say("Sorry, an error occurred with the voice service.");

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
