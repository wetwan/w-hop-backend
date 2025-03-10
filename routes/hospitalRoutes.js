import express from "express";
import {
  changeDoctorAvalibility,
  getHopitalAppointment,
  getHospital,
  getHospitalData,
  getHospitalDoctors,
  hospitalprofile,
  loginHospital,
  registerDoctor,
  registerHospital,
  updateHospital,
} from "../controllers/hospitalController.js";
import upload from "../middlewares/multer.js";
import { protectHospital } from "../middlewares/authMiddle.js";
import { getDoctor } from "../controllers/doctorController.js";

const hospitalRouter = express.Router();

// add doctorr
hospitalRouter.post(
  "/register",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  protectHospital,
  registerDoctor
);
hospitalRouter.post(
  "/update",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "otherImages", maxCount: 10 },
  ]),
  // upload.single("bannerImage"),
  protectHospital,
  updateHospital
);

// add hospital
hospitalRouter.post(
  "/hospital-register",
  upload.single("image"),
  registerHospital
);

// login hospital
hospitalRouter.post("/login", loginHospital);

// get hospital data
hospitalRouter.get("/hospital", protectHospital, getHospitalData);

// get hospital data
// hospitalRouter.get("/hospital/:id", protectHospital, hospitalprofile);
// hospitalRouter.get("/:id", hospitalprofile);

// get hospital data
hospitalRouter.get("/doctor", protectHospital, getHospitalDoctors);
// hospitalRouter.get("/doctors", getHospitalDoctors);

// get hospital data
hospitalRouter.post("/avalibility", protectHospital, changeDoctorAvalibility);

// get hospital data
hospitalRouter.get("/appointments", getHopitalAppointment);

export default hospitalRouter;
