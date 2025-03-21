import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Helper function to upload image to Cloudinary
export async function uploadImage(imageBuffer: Buffer, folder = "profile-images"): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create a writable stream for uploading
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }],
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        return resolve(result?.secure_url || "")
      },
    )

    // Write the buffer to the stream
    uploadStream.write(imageBuffer)
    uploadStream.end()
  })
}

