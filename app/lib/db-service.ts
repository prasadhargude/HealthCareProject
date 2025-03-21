import connectToDatabase from "./mongodb";
import mongoose, { Document } from "mongoose";

// Define interfaces for our models
export interface IDoctor extends Document {
  name: string;
  specialty: string;
  specialties: string[];
  image: string;
  fees: number;
  experience: number;
  rating: number;
  about: string;
}

export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  specialty: string;
  status: string;
  symptoms: string;
  description: string;
  createdAt: Date;
  paymentId?: string;
  paymentStatus?: string;
  paymentOrderId?: string;
  doctorName?: string;
}

// Add to your IAppointment interface
export interface IVideoConsultation extends Document {
  appointmentId: mongoose.Types.ObjectId;
  meetingId: string;
  roomUrl: string;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  specialty: string;
  status: string; // scheduled, completed, cancelled
  symptoms: string;
  notes: string;
  paymentId?: string;
  paymentStatus?: string;
  createdAt: Date;
  doctorName?: string; // Add this field
}

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory: string[];
  userId: mongoose.Types.ObjectId;
}

export interface ITimeslot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  isBooked: boolean;
}

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

// Define Mongoose schemas
const doctorSchema = new mongoose.Schema<IDoctor>({
  name: String,
  specialty: String,
  specialties: [String],
  image: String,
  fees: Number,
  experience: Number,
  rating: Number,
  about: String,
});

const appointmentSchema = new mongoose.Schema<IAppointment>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  date: String,
  time: String,
  specialty: String,
  status: { type: String, default: 'pending' },
  symptoms: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  // Add all payment-related fields to schema
  paymentId: { type: String, required: false },
  paymentStatus: { type: String, required: false },
  paymentOrderId: { type: String, required: false },
  doctorName: { type: String, required: false },
});

// Add this schema definition
const videoConsultationSchema = new mongoose.Schema<IVideoConsultation>({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  meetingId: String,
  roomUrl: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: String,
  patientEmail: String,
  patientPhone: String,
  date: String,
  time: String,
  specialty: String,
  status: { type: String, default: 'scheduled' },
  symptoms: String,
  notes: String,
  paymentId: { type: String, required: false },
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  doctorName: { type: String, required: false }, // Add this field
});

const patientSchema = new mongoose.Schema<IPatient>({
  name: String,
  email: String,
  phone: String,
  address: String,
  medicalHistory: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const timeslotSchema = new mongoose.Schema<ITimeslot>({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: String,
  time: String,
  isBooked: { type: Boolean, default: false },
});

const paymentSchema = new mongoose.Schema<IPayment>({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  orderId: String,
  amount: Number,
  currency: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

// Create or get models
function getModel<T extends Document>(name: string, schema: mongoose.Schema<T>): mongoose.Model<T> {
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
}

// Models
export const Doctor = () => getModel<IDoctor>('Doctor', doctorSchema);
export const Appointment = () => getModel<IAppointment>('Appointment', appointmentSchema);
export const Patient = () => getModel<IPatient>('Patient', patientSchema);
export const Timeslot = () => getModel<ITimeslot>('Timeslot', timeslotSchema);
export const Payment = () => getModel<IPayment>('Payment', paymentSchema);
// Add this to your models
export const VideoConsultation = () => getModel<IVideoConsultation>('VideoConsultation', videoConsultationSchema);

// Type for lean documents (plain JS objects)
export type LeanDoc<T> = {
  _id: string;
} & {
  [K in keyof Omit<T, keyof Document | '_id'>]: T[K] extends mongoose.Types.ObjectId 
    ? string 
    : T[K] extends mongoose.Types.ObjectId[] 
      ? string[] 
      : T[K];
};

// Doctor-related functions
export async function getDoctors(query = {}): Promise<LeanDoc<IDoctor>[]> {
  await connectToDatabase();
  const results = await Doctor().find(query).lean();
  return results as unknown as LeanDoc<IDoctor>[];
}

export async function getDoctorById(id: string): Promise<LeanDoc<IDoctor> | null> {
  await connectToDatabase();
  const result = await Doctor().findById(id).lean();
  return result as unknown as LeanDoc<IDoctor> | null;
}

export async function getDoctorsBySpecialty(specialty: string): Promise<LeanDoc<IDoctor>[]> {
  await connectToDatabase();
  const results = await Doctor().find({ specialties: specialty }).lean();
  return results as unknown as LeanDoc<IDoctor>[];
}

// Appointment-related functions
export async function createAppointment(appointmentData: Partial<IAppointment>): Promise<LeanDoc<IAppointment>> {
  await connectToDatabase();
  const appointment = new (Appointment())(appointmentData);
  await appointment.save();
  return appointment.toObject() as unknown as LeanDoc<IAppointment>;
}

export async function getAppointmentsByDoctor(doctorId: string): Promise<LeanDoc<IAppointment>[]> {
  await connectToDatabase();
  const results = await Appointment().find({ doctorId }).lean();
  return results as unknown as LeanDoc<IAppointment>[];
}

export async function getAppointmentsByPatient(patientId: string): Promise<LeanDoc<IAppointment>[]> {
  await connectToDatabase();
  const results = await Appointment().find({ patientId }).lean();
  return results as unknown as LeanDoc<IAppointment>[];
}

export async function updateAppointment(id: string, updateData: Partial<IAppointment>): Promise<LeanDoc<IAppointment> | null> {
  await connectToDatabase();
  await Appointment().findByIdAndUpdate(id, updateData);
  return getAppointmentById(id);
}

export async function getAppointmentById(id: string): Promise<LeanDoc<IAppointment> | null> {
  await connectToDatabase();
  const result = await Appointment().findById(id).lean();
  return result as unknown as LeanDoc<IAppointment> | null;
}

// Patient-related functions
export async function createPatient(patientData: Partial<IPatient>): Promise<LeanDoc<IPatient>> {
  await connectToDatabase();
  const patient = new (Patient())(patientData);
  await patient.save();
  return patient.toObject() as unknown as LeanDoc<IPatient>;
}

export async function getPatientById(id: string): Promise<LeanDoc<IPatient> | null> {
  await connectToDatabase();
  const result = await Patient().findById(id).lean();
  return result as unknown as LeanDoc<IPatient> | null;
}

export async function updatePatient(id: string, updateData: Partial<IPatient>): Promise<LeanDoc<IPatient> | null> {
  await connectToDatabase();
  await Patient().findByIdAndUpdate(id, updateData);
  return getPatientById(id);
}

// Timeslot-related functions
export async function getAvailableTimeslots(doctorId: string, date: string): Promise<LeanDoc<ITimeslot>[]> {
  await connectToDatabase();
  const results = await Timeslot().find({
    doctorId,
    date,
    isBooked: false,
  }).lean();
  return results as unknown as LeanDoc<ITimeslot>[];
}

export async function bookTimeslot(timeslotId: string): Promise<void> {
  await connectToDatabase();
  await Timeslot().findByIdAndUpdate(timeslotId, { isBooked: true });
}

// Payment-related functions
export async function createPayment(paymentData: Partial<IPayment>): Promise<LeanDoc<IPayment>> {
  await connectToDatabase();
  const payment = new (Payment())(paymentData);
  await payment.save();
  return payment.toObject() as unknown as LeanDoc<IPayment>;
}

export async function getPaymentByOrderId(orderId: string): Promise<LeanDoc<IPayment> | null> {
  await connectToDatabase();
  const result = await Payment().findOne({ orderId }).lean();
  return result as unknown as LeanDoc<IPayment> | null;
}

export async function updatePaymentStatus(orderId: string, status: string): Promise<void> {
  await connectToDatabase();
  await Payment().findOneAndUpdate({ orderId }, { status });
}

// Add these functions for video consultations
export async function createVideoConsultation(consultationData: Partial<IVideoConsultation>): Promise<LeanDoc<IVideoConsultation>> {
  await connectToDatabase();
  const consultation = new (VideoConsultation())(consultationData);
  await consultation.save();
  return consultation.toObject() as unknown as LeanDoc<IVideoConsultation>;
}

export async function getVideoConsultationById(id: string): Promise<LeanDoc<IVideoConsultation> | null> {
  await connectToDatabase();
  const result = await VideoConsultation().findById(id).lean();
  return result as unknown as LeanDoc<IVideoConsultation> | null;
}

export async function getVideoConsultationByMeetingId(meetingId: string): Promise<LeanDoc<IVideoConsultation> | null> {
  await connectToDatabase();
  const result = await VideoConsultation().findOne({ meetingId }).lean();
  return result as unknown as LeanDoc<IVideoConsultation> | null;
}

export async function updateVideoConsultation(id: string, updateData: Partial<IVideoConsultation>): Promise<LeanDoc<IVideoConsultation> | null> {
  await connectToDatabase();
  await VideoConsultation().findByIdAndUpdate(id, updateData);
  return getVideoConsultationById(id);
}

export async function getVideoConsultationsByDoctor(doctorId: string): Promise<LeanDoc<IVideoConsultation>[]> {
  await connectToDatabase();
  const results = await VideoConsultation().find({ doctorId }).lean();
  return results as unknown as LeanDoc<IVideoConsultation>[];
}

export async function getVideoConsultationsByPatient(patientId: string): Promise<LeanDoc<IVideoConsultation>[]> {
  await connectToDatabase();
  const results = await VideoConsultation().find({ patientId }).lean();
  return results as unknown as LeanDoc<IVideoConsultation>[];
}




