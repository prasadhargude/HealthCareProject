import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  birthDate: {
    type: String,
    required: [true, "Date of birth is required"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  emergencyContactName: {
    type: String,
    required: [true, "Emergency contact name is required"],
  },
  emergencyContactNumber: {
    type: String,
    required: [true, "Emergency contact number is required"],
  },
  allergies: {
    type: String,
    default: "",
  },
  currentMedication: {
    type: String,
    default: "",
  },
  pastMedicalHistory: {
    type: String,
    default: "",
  },
  treatmentConsent: {
    type: Boolean,
    required: [true, "Treatment consent is required"],
  },
  privacyConsent: {
    type: Boolean,
    required: [true, "Privacy consent is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already defined to prevent overwriting
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;