import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    field: { type: String, required: true },
    image: { type: String, required: true },
    bannerImage: { type: String, required: true },
    website: { type: String, required: true },
    College: { type: String, required: true },
    experience: { type: Date, required: true },
    about: { type: String, required: true },
    phone: { type: String, required: true },
    available: { type: Boolean, default: true },

    state: { type: String, required: true },
    date: { type: Number, required: true },
    slots_booked: {
      type: Object,
      default: {},
    },
    hospitatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default doctorModel;
