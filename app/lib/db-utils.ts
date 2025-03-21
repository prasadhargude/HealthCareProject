import { ObjectId } from "mongodb"
import connectToDatabase from "./mongodb"
import mongoose from "mongoose"

/**
 * Updates a user document in the users collection
 */
export async function updateUserById(userId: string, updateData: Record<string, any>) {
  const mongooseInstance = await connectToDatabase()

  if (!mongooseInstance.connection.db) {
    throw new Error("MongoDB connection failed: 'db' is undefined")
  }

  const db = mongooseInstance.connection.db
  const result = await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: updateData })

  return result
}

/**
 * Finds a user by ID
 */
export async function findUserById(userId: string) {
  const mongooseInstance = await connectToDatabase()

  if (!mongooseInstance.connection.db) {
    throw new Error("MongoDB connection failed: 'db' is undefined")
  }

  const db = mongooseInstance.connection.db
  return db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { password: 0 } }, // Exclude password
  )
}

/**
 * Generic function to get a collection from the database
 */
export async function getCollection(collectionName: string) {
  const mongooseInstance = await connectToDatabase()

  if (!mongooseInstance.connection.db) {
    throw new Error("MongoDB connection failed: 'db' is undefined")
  }

  return mongooseInstance.connection.db.collection(collectionName)
}
