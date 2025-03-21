// This file contains utility functions for interacting with VideoSDK
import jwt from "jsonwebtoken";

// Replace with your actual VideoSDK API key and secret
const API_KEY = process.env.VIDEOSDK_API_KEY || "";
const SECRET_KEY = process.env.VIDEOSDK_API_SECRET || "";
const API_ENDPOINT = "https://api.videosdk.live/v2";

export async function createMeeting() {
  try {
    // Generate a token for API authentication
    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],
    };
    
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "24h",
      algorithm: "HS256",
    });

    const response = await fetch(`${API_ENDPOINT}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("VideoSDK API error:", errorData);
      throw new Error(`Failed to create meeting: ${response.status}`);
    }

    const data = await response.json();
    console.log("Meeting created successfully:", data);
    return data.roomId;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
}

export function generateMeetingLink(meetingId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/video-consult/meeting/${meetingId}`;
}

export async function validateMeeting(meetingId: string) {
  try {
    if (!meetingId) {
      console.error("Meeting ID is undefined or null");
      return false;
    }

    // Generate a token for API authentication
    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],
    };
    
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "24h",
      algorithm: "HS256",
    });

    const response = await fetch(
      `${API_ENDPOINT}/rooms/validate/${meetingId}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Failed to validate meeting: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    return data.roomId === meetingId;
  } catch (error) {
    console.error("Error validating meeting:", error);
    return false;
  }
}

// Add a function to get all available doctors
export async function getDoctorsForVideoConsultation(specialty?: string) {
  try {
    const url = specialty 
      ? `/api/doctors?specialty=${encodeURIComponent(specialty)}` 
      : '/api/doctors';
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch doctors");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
}