import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    console.log("📌 Received Signup Data:", userData); // Debug log

    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Ensure all required fields exist
    const requiredFields = [
      "name", "email", "password", "phone", "birthDate",
      "gender", "address", "emergencyContactName", "emergencyContactNumber",
      "treatmentConsent", "privacyConsent"
    ];
    
    for (const field of requiredFields) {
      if (!userData[field] && userData[field] !== false) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Save user data to MongoDB
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
    });

    console.log("✅ User Created Successfully:", newUser._id);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error in Signup:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}