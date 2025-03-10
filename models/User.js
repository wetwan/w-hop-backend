import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  state: { type: String },
  gender: { type: String },
  image: { type: String, required: true },
  dob: { type: Date },
  height: { type: String },
  weight: { type: String },
  blood_group: { type: String },
  blood_genotype: { type: String },
  marital_status: { type: String },
  kin_firstName: { type: String },
  kin_lastName: { type: String },
  kin_address: { type: String },
  kin_state: { type: String },
  kin_phone: { type: String },
  kin_email: { type: String },
  kin_gender: { type: String },
  kin_relationship: { type: String },
});

const User = mongoose.model("User", userSchema);

export default User;
