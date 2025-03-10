import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String },
  website: { type: String },
  address: { type: String },
  phone: {
    type: String,
    match: [/^\d{10,15}$/, "Invalid phone number"],
  },
  facility: { type: [String], default: [] },
  ownership: { type: String },
  about: { type: String },
  banner: { type: String },
  state: { type: String },
  otherImages: { type: [String], default: [] },
});

const hospitalModel =
  mongoose.models.Hospital || mongoose.model("Hospital", hospitalSchema);

export default hospitalModel;
