import jwt from "jsonwebtoken";
import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorMode.js";

export const protectHospital = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.json({ success: false, message: "Not authorized, Login again" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SERECT);
    req.hospital = await hospitalModel.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const protectDoctor = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.json({ success: false, message: "Not authorized, Login again" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SERECT);
    req.hospital = await doctorModel.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
