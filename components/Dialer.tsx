"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { type Call, Device, type ConnectOptions } from "@twilio/voice-sdk";
import {
  getCallHistory,
  addCallToHistory,
  formatTimestamp,
  type CallHistoryEntry,
} from "../utils/call-history";

type DialerProps = {};

const Dialer: React.FC<DialerProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("Initializing...");
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load call history on component mount
  useEffect(() => {
    setCallHistory(getCallHistory());
  }, []);

  useEffect(() => {
    // Initialize Twilio device on component mount
    const setupDevice = async () => {
      try {
        setStatus("Fetching token...");
        setError(null);

        // Try the main token endpoint first
        let token = await fetchToken("/api/token");

        // If that fails, try the simple token endpoint
        if (!token) {
          token = await fetchToken("/api/simple-token");
        }

        // If we still don't have a token, throw an error
        if (!token) {
          throw new Error("Failed to get a valid token from either endpoint");
        }

        setStatus("Initializing device...");

        // Initialize the device with the new SDK
        const device = new Device(token, {
          codecPreferences: ["opus", "pcmu"],
          enableRingingState: true,
          debug: true, // Enable debug logging
        });

        // Set up event listeners
        device.on("registered", () => {
          setStatus("Ready");
          console.log("Twilio device is registered");
        });

        device.on("registrationFailed", (error) => {
          setStatus(`Registration Error`);
          setError(`Registration failed: ${error.message}`);
          console.error("Twilio device registration error:", error);
        });

        device.on("error", (error) => {
          setStatus(`Device Error`);
          setError(`Twilio error: ${error.message}`);
          console.error("Twilio device error:", error);
        });

        device.on("incoming", (call) => {
          callRef.current = call;
          setStatus("Incoming call...");

          call.on("accept", () => {
            setStatus("Connected");
            setIsCallInProgress(true);
            startCallTimer();
          });

          call.on("disconnect", () => {
            setStatus("Call ended");
            setIsCallInProgress(false);
            callRef.current = null;
            stopCallTimer();
          });

          call.on("error", (error) => {
            setStatus(`Call Error`);
            setError(`Call error: ${error.message}`);
            console.error("Call error:", error);
            setIsCallInProgress(false);
            callRef.current = null;
            stopCallTimer();
          });
        });

        // Store the device reference
        deviceRef.current = device;

        // Register the device
        await device.register();
      } catch (error: any) {
        console.error("Error setting up Twilio device:", error);
        setStatus(`Setup failed`);
        setError(`${error.message || "Unknown error"}`);
      }
    };

    // Helper function to fetch a token from an endpoint
    const fetchToken = async (endpoint: string): Promise<string | null> => {
      try {
        console.log(`Fetching token from ${endpoint}...`);
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            `Error from ${endpoint}:`,
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error(`Response body:`, errorText);
          return null;
        }

        const data = await response.json();
        if (!data.token) {
          console.error(`No token in response from ${endpoint}:`, data);
          return null;
        }

        console.log(`Successfully got token from ${endpoint}`);
        return data.token;
      } catch (error) {
        console.error(`Failed to fetch token from ${endpoint}:`, error);
        return null;
      }
    };

    setupDevice();

    // Cleanup on component unmount
    return () => {
      if (callRef.current) {
        callRef.current.disconnect();
      }
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      stopCallTimer();
    };
  }, []);

  const startCallTimer = () => {
    setCallDuration(0);
    stopCallTimer();
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers, +, and spaces
    const value = e.target.value.replace(/[^\d+\s-]/g, "");
    setPhoneNumber(value);
  };

  const handleCall = async () => {
    if (!deviceRef.current || !phoneNumber) return;

    try {
      setStatus("Calling...");
      setError(null);

      // Make the call with the new SDK
      const connectOptions: ConnectOptions = {
        params: {
          To: phoneNumber,
        },
      };

      const call = await deviceRef.current.connect(connectOptions);
      callRef.current = call;

      // Set up call event listeners
      call.on("accept", () => {
        setStatus("Connected");
        setIsCallInProgress(true);
        startCallTimer();
      });

      call.on("disconnect", () => {
        // Add to call history when the call ends
        const updatedHistory = addCallToHistory(phoneNumber, callDuration);
        setCallHistory(updatedHistory);

        setStatus("Call ended");
        setIsCallInProgress(false);
        setIsMuted(false);
        callRef.current = null;
        stopCallTimer();
      });

      call.on("error", (error) => {
        setStatus(`Call Error`);
        setError(`Call error: ${error.message}`);
        console.error("Call error:", error);
        setIsCallInProgress(false);
        setIsMuted(false);
        callRef.current = null;
        stopCallTimer();
      });
    } catch (error: any) {
      console.error("Error making call:", error);
      setStatus(`Call failed`);
      setError(`${error.message || "Unknown error"}`);
    }
  };

  const handleHangup = () => {
    if (callRef.current) {
      callRef.current.disconnect();
    }
  };

  const handleToggleMute = () => {
    if (callRef.current) {
      if (isMuted) {
        callRef.current.mute(false);
        setIsMuted(false);
      } else {
        callRef.current.mute(true);
        setIsMuted(true);
      }
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleHistoryItemClick = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Skype-like header */}
      <div className="bg-[#0078d4] text-white p-4">
        <h1 className="text-2xl font-bold text-center">Twilio Dialer</h1>
        <p className="text-center text-sm opacity-80">Status: {status}</p>
      </div>

      {error ? (
        <div className="p-4 bg-red-100 border-b border-red-400 text-red-700">
          <h3 className="font-bold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-[#0078d4] text-white rounded-md hover:bg-[#006cbe] focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Phone input */}
          <div className="p-4 border-b">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="+1 555 123 4567"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:border-transparent"
              disabled={isCallInProgress || status !== "Ready"}
            />

            {isCallInProgress && (
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-700">
                  Duration:{" "}
                  <span className="font-bold">
                    {formatCallDuration(callDuration)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Call history */}
          {callHistory.length > 0 && (
            <div className="border-b">
              <h2 className="px-4 py-2 bg-gray-100 font-medium text-gray-700">
                Recent Calls
              </h2>
              <ul className="divide-y divide-gray-200">
                {callHistory.map((entry, index) => (
                  <li
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => handleHistoryItemClick(entry.phoneNumber)}
                  >
                    <div>
                      <p className="font-medium text-[#0078d4]">
                        {entry.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                    {entry.duration !== undefined && (
                      <span className="text-sm text-gray-500">
                        {formatCallDuration(entry.duration)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Call controls */}
          <div className="p-6 flex justify-center">
            {!isCallInProgress ? (
              <button
                onClick={handleCall}
                disabled={!phoneNumber || status !== "Ready"}
                className="w-16 h-16 rounded-full bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#006cbe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
            ) : (
              <div className="flex space-x-6">
                <button
                  onClick={handleToggleMute}
                  className={`w-14 h-14 rounded-full ${
                    isMuted
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  } text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleHangup}
                  className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {status === "Ready" && !isCallInProgress && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                <p className="text-sm">
                  Dialer is ready. Enter a phone number or select from recent
                  calls.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dialer;
