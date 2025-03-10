import express from "express";
import upload from "../middlewares/multer.js";
import {
  appointmentDetails,
  changeDoctorAppointmentStatus,
  getDoctor,
  getDoctorAppointment,
  getDoctorData,
  getDoctorprofile,
  loginDoctor,
  updateDoctorProfileImage,
} from "../controllers/doctorController.js";
import { protectDoctor } from "../middlewares/authMiddle.js";

const DoctorRouter = express.Router();

// login docotr
DoctorRouter.post("/login", loginDoctor);

// login docotr
DoctorRouter.post(
  "/doctor-updateDp",
  upload.single("image"),
  updateDoctorProfileImage
);

// get  data
DoctorRouter.get("/", protectDoctor, getDoctorData);

DoctorRouter.get("/:id", protectDoctor, getDoctorprofile);
DoctorRouter.get("/doctor/:id", getDoctorprofile);

// get  data
DoctorRouter.get("/appointments", getDoctorAppointment);

// login docotr
DoctorRouter.post(
  "/appointment-status",
  protectDoctor,
  changeDoctorAppointmentStatus
);
DoctorRouter.post("/details", protectDoctor, appointmentDetails);

export default DoctorRouter;
