import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true }, // ✅ Fixed naming
    date: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    hospitalId: {
      // ✅ Fixed naming
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ Ensure this is ObjectId
      ref: "Doctor", // ✅ Reference the correct model
      required: true,
    },
    userId: {
      type: String, // ✅ Fixed ObjectId type
      ref: "User",
      required: true,
    },
  },
  { minimize: false }
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;
