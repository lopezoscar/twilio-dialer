"use client";

import dynamic from "next/dynamic";
import Layout from "../components/Layout";

// Import the Dialer component with no SSR since it uses browser-only APIs
const Dialer = dynamic(() => import("../components/Dialer"), {
  ssr: false,
  loading: () => (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="bg-[#0078d4] text-white p-4 -m-6 mb-6">
        <h1 className="text-2xl font-bold">Twilio Dialer</h1>
      </div>
      <p className="text-lg mb-4">Loading dialer...</p>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0078d4] rounded-full animate-pulse"
          style={{ width: "100%" }}
        ></div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <Layout title="Twilio Dialer">
      <Dialer />
    </Layout>
  );
}
