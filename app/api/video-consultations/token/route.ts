import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function GET() {
  try {
    const API_KEY = process.env.VIDEOSDK_API_KEY;
    const SECRET_KEY = process.env.VIDEOSDK_API_SECRET;

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json(
        { error: 'VideoSDK credentials are not configured' },
        { status: 500 }
      );
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expireTimestamp = currentTimestamp + 24 * 60 * 60; // Token valid for 24 hours

    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"], // Permissions
      version: 2,
      roles: ["CRAWLER", "RTMP"],
      roomId: "*", // For all rooms
      participantId: "*", // For all participants
      exp: expireTimestamp
    };

    // Properly encode JWT components (base64url encoding)
    const base64URLEncode = (str: string) => {
      return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64URLEncode(JSON.stringify(header));
    const encodedPayload = base64URLEncode(JSON.stringify(payload));
    
    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', SECRET_KEY)
      .update(signatureInput)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Create token
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}