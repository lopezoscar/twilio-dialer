# Twilio Dialer

A Next.js application that allows you to make outbound calls using Twilio's Voice SDK.

## Prerequisites

You need to have the following Twilio credentials:

- Twilio Account SID
- Twilio Auth Token
- Twilio TwiML App SID
- Twilio Phone Number
- (Optional but recommended) Twilio API Key and Secret

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_TWIML_APP_SID=your_twiml_app_sid
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_API_KEY=your_api_key (optional)
TWILIO_API_SECRET=your_api_secret (optional)
\`\`\`

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Make outbound calls
- Mute/unmute during calls
- Call status tracking
- Call duration timer
- Responsive design

## Setting up Twilio

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Purchase a phone number with voice capabilities
3. Create a TwiML App in the Twilio console
4. Set the Voice Request URL to `https://your-domain.com/api/voice`
5. Set the Status Callback URL to `https://your-domain.com/api/status-callback`
6. Create API Key and Secret for better security (recommended)

## Deployment

This project is ready to be deployed on Vercel. Make sure to add the environment variables to your Vercel project settings.
