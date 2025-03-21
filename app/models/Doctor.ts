import mongoose from 'mongoose'

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  specialties: { type: [String], required: true },
  image: { type: String, default: '/placeholder.svg' },
  fees: { type: Number, required: true },
  experience: { type: Number, required: false },
  rating: { type: Number, required: false },
})

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema)
