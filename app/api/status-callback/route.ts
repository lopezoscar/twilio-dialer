import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    // Extract important information from the callback
    const CallSid = body.get("CallSid");
    const CallStatus = body.get("CallStatus");
    const CallDuration = body.get("CallDuration");
    const From = body.get("From");
    const To = body.get("To");
    const Direction = body.get("Direction");
    const Timestamp = body.get("Timestamp");

    // Log the call status
    console.log("Call Status Update:", Object.fromEntries(body.entries()));

    // Log structured information
    console.log({
      sid: CallSid,
      status: CallStatus,
      duration: CallDuration,
      from: From,
      to: To,
      direction: Direction,
      timestamp: Timestamp,
    });

    // You can add additional logic here to handle different call statuses
    // For example, storing call logs in a database

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing status callback:", error);
    return NextResponse.json(
      { error: "Failed to process status callback" },
      { status: 500 }
    );
  }
}
