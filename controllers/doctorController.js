//  login  Doctor

import doctorModel from "../models/doctorMode.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/genrateToken.js";
import AppointmentDetail from "../models/appointmentdetails.js";
import Appointment from "../models/appointment.js";
import review from "../models/review.js";

export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (await bcrypt.compare(password, doctor.password)) {
      // Added await for bcrypt.compare
      res.json({
        success: true,
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
        },
        token: generateToken(doctor._id),
        message: "Loged in successfully ",
      });
    } else {
      res.json({ success: false, message: "Invalid email or password" }); // Corrected typo and status code
    }
  } catch (error) {
    res.json({ sucsess: false, message: error.message });
  }
};

//  get  Doctordata

export const getDoctorData = async (req, res) => {
  try {
    const doctor = req.doctor;

    res.json({ success: true, doctor });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//  get  DoctorProfile
export const getDoctorprofile = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await doctorModel.findById(id).select("-password");

    // Send doctor data as a response
    res.json({ success: true, doctor });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//  get  DoctorProfilePic

export const updateDoctorProfileImage = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const imageFile = req.file;

    const doctor = await doctorModel.findById(doctorId);

    if (doctor.image && doctor.image.public_id) {
      await cloudinary.uploader.destroy(doctor.image.public_id);
    }

    const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    doctor.image = {
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
    };

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor's image updated successfully",
      image: doctor.image,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//  get  Doctorappointment

export const getDoctorAppointment = async (req, res) => {
  try {
    const doctor = req.doctorId;
    // Fetching appointments based on hospitalId
    const appointments = await Appointment.find({ doctor })
      .populate("hospitalId", "name image")
      .populate("doctorId", "firstName lastName image")
      .populate(
        "userId",
        "firstName lastName image email gender phone weight height blood_group blood_genotype marital_status kin_firstName kin_lastName kin_address kin_state kin_phone kin_email"
      )
      .exec();

    res.json({ success: true, appointments });
    console.log(doctor);
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAppointmentdetails = async (req, res) => {
  try {
    const appointment = await AppointmentDetail.find({})

      .populate("doctorId", "firstName lastName image")
      .populate("appointmentID", "date")
      .exec();

    res.json({ success: true, appointment });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//  chnage DoctorAppointment status

export const changeDoctorAppointmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id },
      { status }
    );
    if (!appointment) {
      return res
        .status(401)
        .json({ success: false, message: "Appointment ID not found" });
    }
    appointment.status = status;
    await appointment.save();
    res.json({
      success: true,
      appointment,
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//  chnage AppointmentDetails

export const appointmentDetails = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);

    const {
      doctorId,
      appointmentID,
      reason,
      history,
      temperature,
      pulse,
      respiration,
      blood_pressure,
      diagnosis,
      prescriptions,
    } = req.body;
    // Ensure doctorId and appointmentID are provided
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor details are missing.",
      });
    }

    if (!appointmentID) {
      return res.status(400).json({
        success: false,
        message: "Appointment details are missing.",
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!reason) missingFields.push("reason");
    if (!history) missingFields.push("history");
    if (!temperature) missingFields.push("temperature");
    if (!pulse) missingFields.push("pulse");
    if (!respiration) missingFields.push("respiration");
    if (!blood_pressure) missingFields.push("blood_pressure");
    if (!diagnosis) missingFields.push("diagnosis");
    if (!prescriptions) missingFields.push("prescriptions");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing details: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Create new appointment detail
    const appointmentData = new AppointmentDetail({
      reason,
      history,
      temperature,
      pulse,
      respiration,
      blood_pressure,
      diagnosis,
      prescriptions,
      doctorId,
      appointmentID,
      date: Date.now(),
    });

    await appointmentData.save();

    return res.status(201).json({
      success: true,
      message: "Appointment details added successfully.",
      data: appointmentData,
    });
  } catch (error) {
    console.error("Error in addAppointmentDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

// get docotr review

export const getDocReivew = async (res, req) => {
  try {
    const { id } = req.body;
    const docid = await review.findById(id);
    if (!docid) {
      return res
        .status(401)
        .json({ success: false, message: "Doctor ID not found" });
    }
    res.json({ success: true, docid });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ available: true })
      .select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
