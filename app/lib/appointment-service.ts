import mongoose, { Schema, type Document } from "mongoose"
import connectToDatabase from "@/lib/mongodb"

// Define interfaces for the models
export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId
  patientId?: mongoose.Types.ObjectId
  patientName: string
  patientEmail: string
  patientPhone: string
  date: string
  time: string
  specialty: string
  status: string
  symptoms: string
  description?: string
  createdAt: Date
  doctorName: string
}

export interface IVideoConsultation extends Document {
  appointmentId: mongoose.Types.ObjectId
  meetingId: string
  roomUrl: string
  doctorId: mongoose.Types.ObjectId
  patientId?: mongoose.Types.ObjectId
  patientName: string
  patientEmail: string
  patientPhone: string
  date: string
  time: string
  specialty: string
  status: string
  symptoms: string
  notes?: string
  paymentStatus?: string
  paymentId?: string
  createdAt: Date
  doctorName: string
}

// Define custom types for lean documents (plain JS objects)
// Instead of using mongoose.LeanDocument which doesn't exist in your version
export type LeanAppointment = {
  _id: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  specialty: string;
  status: string;
  symptoms: string;
  description?: string;
  createdAt: Date;
  doctorName: string;
  [key: string]: any; // For any additional fields
}

export type LeanVideoConsultation = {
  _id: string;
  appointmentId: string;
  meetingId: string;
  roomUrl: string;
  doctorId: string;
  patientId?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  specialty: string;
  status: string;
  symptoms: string;
  notes?: string;
  paymentStatus?: string;
  paymentId?: string;
  createdAt: Date;
  doctorName: string;
  [key: string]: any; // For any additional fields
}

// Define schemas
const AppointmentSchema = new Schema<IAppointment>({
  doctorId: { type: Schema.Types.ObjectId, required: true },
  patientId: { type: Schema.Types.ObjectId },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, default: "pending" },
  symptoms: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  doctorName: { type: String, required: true },
})

const VideoConsultationSchema = new Schema<IVideoConsultation>({
  appointmentId: { type: Schema.Types.ObjectId, required: true, ref: "Appointment" },
  meetingId: { type: String, required: true },
  roomUrl: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, required: true },
  patientId: { type: Schema.Types.ObjectId },
  patientName: { type: String, required: true },
  patientEmail: { type: String, required: true },
  patientPhone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  specialty: { type: String, required: true },
  status: { type: String, default: "scheduled" },
  symptoms: { type: String },
  notes: { type: String },
  paymentStatus: { type: String, default: "pending" },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
  doctorName: { type: String, required: true },
})

// Get models (with check to prevent model redefinition)
export function getAppointmentModel() {
  return mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema)
}

export function getVideoConsultationModel() {
  return (
    mongoose.models.VideoConsultation ||
    mongoose.model<IVideoConsultation>("VideoConsultation", VideoConsultationSchema)
  )
}

// Service functions
export async function getPatientAppointments(email: string): Promise<LeanAppointment[]> {
  await connectToDatabase()
  const Appointment = getAppointmentModel()
  const appointments = await Appointment.find({ patientEmail: email }).sort({ date: -1, time: -1 }).lean()
  return appointments as unknown as LeanAppointment[]
}

export async function getPatientVideoConsultations(email: string): Promise<LeanVideoConsultation[]> {
  await connectToDatabase()
  const VideoConsultation = getVideoConsultationModel()
  const consultations = await VideoConsultation.find({ patientEmail: email }).sort({ date: -1, time: -1 }).lean()
  return consultations as unknown as LeanVideoConsultation[]
}

export async function getAppointmentById(id: string): Promise<LeanAppointment | null> {
  await connectToDatabase()
  const Appointment = getAppointmentModel()
  const appointment = await Appointment.findById(id).lean()
  return appointment as unknown as LeanAppointment | null
}

export async function getVideoConsultationById(id: string): Promise<LeanVideoConsultation | null> {
  await connectToDatabase()
  const VideoConsultation = getVideoConsultationModel()
  const consultation = await VideoConsultation.findById(id).lean()
  return consultation as unknown as LeanVideoConsultation | null
}

export async function getVideoConsultationByMeetingId(meetingId: string): Promise<LeanVideoConsultation | null> {
  await connectToDatabase()
  const VideoConsultation = getVideoConsultationModel()
  const consultation = await VideoConsultation.findOne({ meetingId }).lean()
  return consultation as unknown as LeanVideoConsultation | null
}

export async function getVideoConsultationByAppointmentId(appointmentId: string): Promise<LeanVideoConsultation | null> {
  await connectToDatabase()
  const VideoConsultation = getVideoConsultationModel()
  const consultation = await VideoConsultation.findOne({
    appointmentId: new mongoose.Types.ObjectId(appointmentId),
  }).lean()
  return consultation as unknown as LeanVideoConsultation | null
}

export async function updateAppointmentStatus(id: string, status: string): Promise<LeanAppointment | null> {
  await connectToDatabase()
  const Appointment = getAppointmentModel()
  const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true }).lean()
  return appointment as unknown as LeanAppointment | null
}

export async function updateVideoConsultationStatus(id: string, status: string): Promise<LeanVideoConsultation | null> {
  await connectToDatabase()
  const VideoConsultation = getVideoConsultationModel()
  const consultation = await VideoConsultation.findByIdAndUpdate(id, { status }, { new: true }).lean()
  return consultation as unknown as LeanVideoConsultation | null
}