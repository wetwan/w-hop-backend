import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    message: { type: String, required: true },

    hospitatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospitalModel",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorModel",
      required: true,
    },
  },
  { minimize: false }
);

const review = mongoose.models.review || mongoose.model("review", reviewSchema);

export default review;
