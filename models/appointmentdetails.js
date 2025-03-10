import mongoose from "mongoose";


const appointmentDetailsSchmea = new mongoose.Schema({
  // hospitatId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Hospital",
  //   required: true,
  // },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  // userId: {
  //   type: String,
  //   ref: "User",
  //   required: true,
  // },
  appointmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  reason: { type: String, required: true },
  history: { type: String, required: true },
  temperature: { type: String, required: true },
  pulse: { type: String, required: true },
  respiration: { type: String, required: true },
  blood_pressure: { type: String, required: true },
  diagnosis: { type: String, required: true },
  prescriptions: { type: String, required: true },
  date: { type: Number, required: true },
});

const AppointmentDetail =
  mongoose.models.AppointmentDetail ||
  mongoose.model("AppointmentDetail", appointmentDetailsSchmea);

export default AppointmentDetail;
