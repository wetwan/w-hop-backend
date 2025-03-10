import express from "express";
import {
  addRviews,
  appointment,
  getUserAppointment,
  userData,
  userUpdate,
} from "../controllers/userController.js";
import upload from "../middlewares/multer.js";
import { getAppointmentdetails, getDoctor } from "../controllers/doctorController.js";
import { getHospital } from "../controllers/hospitalController.js";
import { requireAuth } from "@clerk/express"; 
const router = express.Router();



// get user data
router.get("/user",requireAuth(), userData);
router.get("/doctor", getDoctor);
router.get("/hospital", getHospital);


// update user data
router.post("/update", requireAuth(), upload.single("image"), userUpdate);
router.post("/review", addRviews);

// make appointment data
router.post("/apply", appointment);
// make appointment data
router.get("/appointments", getUserAppointment);
router.get("/details", getAppointmentdetails);

export default router;
