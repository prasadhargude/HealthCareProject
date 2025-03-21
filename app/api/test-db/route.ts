import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ success: true, message: "✅ MongoDB is connected!" }, { status: 200 });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return NextResponse.json({ success: false, error: "MongoDB connection failed" }, { status: 500 });
  }
}
