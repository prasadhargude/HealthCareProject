import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { updateUserById } from "@/lib/db-utils"
import { uploadImage } from "@/lib/cloudinary"

// Helper function to read the form data stream
async function readFormData(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    throw new Error("No file uploaded")
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return { buffer, filename: file.name, contentType: file.type }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read the uploaded file
    const { buffer, filename } = await readFormData(request)

    // Upload to Cloudinary
    const imageUrl = await uploadImage(buffer)

    if (!imageUrl) {
      throw new Error("Failed to upload image to Cloudinary")
    }

    // Update user profile with the new image URL
    await updateUserById(session.user.id, { profileImage: imageUrl })

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl,
    })
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile image" },
      { status: 500 },
    )
  }
}

