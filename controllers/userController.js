import Appointment from "../models/appointment.js";
import doctorModel from "../models/doctorMode.js";
import hospitalModel from "../models/hospitalModel.js";
import review from "../models/review.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const userData = async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No user ID provided." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

// user update
export const userUpdate = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);
    const {
      phone,
      address,
      state,
      gender,
      dob,
      height,
      weight,
      blood_group,
      blood_genotype,
      marital_status,
      kin_firstName,
      kin_lastName,
      kin_address,
      kin_state,
      kin_phone,
      kin_email,
      kin_gender,
      kin_relationship,
    } = req.body;

    const imageFile = req.file;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let updates = {
      phone,
      address,
      state,
      gender,
      dob,
      height,
      weight,
      blood_group,
      blood_genotype,
      marital_status,
      kin_firstName,
      kin_lastName,
      kin_address,
      kin_state,
      kin_phone,
      kin_email,
      kin_gender,
      kin_relationship,
    };
    const missingFields = [];

    if (!phone) missingFields.push("firstName");
    if (!address) missingFields.push("address");
    if (!state) missingFields.push("state");
    if (!gender) missingFields.push("gender");
    if (!dob) missingFields.push("dob");
    if (!height) missingFields.push("height");
    if (!blood_group) missingFields.push("blood_group");
    if (!blood_genotype) missingFields.push("blood_genotype");
    if (!marital_status) missingFields.push("marital_status");
    if (!kin_firstName) missingFields.push("kin_firstName");
    if (!kin_address) missingFields.push("    kin_address");
    if (!kin_address) missingFields.push(" kin_address");
    if (!kin_state) missingFields.push(" kin_state");
    if (!kin_phone) missingFields.push(" kin_phone");
    if (!kin_email) missingFields.push(" kin_email");
    if (!kin_gender) missingFields.push(" kin_gender");
    if (!kin_relationship) missingFields.push(" kin_relationship");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing details: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    if (user.image) {
      await cloudinary.uploader.destroy(user.image);
    }
    if (imageFile) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updates.image = uploadedImage.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary banner upload error:", cloudinaryError);
        if (cloudinaryError.http_code === 400) {
          // Example: Handle specific Cloudinary error
          return res
            .status(400)
            .json({ success: false, message: "Invalid banner image format" });
        }
        return res
          .status(500)
          .json({ success: false, message: "Banner image upload failed" });
      }
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      hospital: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// user make appointment
export const appointment = async (req, res) => {
  const { doctorId, slotTime, slotDate, hospitalId, userId } = req.body;

  // Validate required fields
  if (!doctorId || !hospitalId || !slotTime || !slotDate || !userId) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: doctorId, hospitalId, slotTime, or slotDate",
    });
  }

  try {
    const docData = await doctorModel.findById(doctorId).select("-password");
    if (!docData)
      return res.json({ success: false, message: "Doctor not found" });

    if (!docData.available)
      return res.json({ success: false, message: "Doctor not available" });

    const hosData = await hospitalModel
      .findById(hospitalId)
      .select("-password");
    if (!hosData)
      return res.json({ success: false, message: "Hospital not found" });

    const userData = await User.findById(userId).select("-password");
    if (!userData)
      return res.json({ success: false, message: "User not found" });

    let slots_booked = docData.slots_booked || {};

    if (!slots_booked[slotDate]) slots_booked[slotDate] = [];

    if (slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    slots_booked[slotDate].push(slotTime);

    const appointment = new Appointment({
      userId,
      doctorId,
      hospitalId,
      docData,
      userData,
      hosData,
      slotDate,
      slotTime,
      date: Date.now(),
    });

    await appointment.save();
    await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });

    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get user appointment
export const getUserAppointment = async (req, res) => {
  try {
    const userID = req.userId;
    // Fetching appointments based on userID
    const appointments = await Appointment.find({ userID })
      .populate("hospitalId", "name image")
      .populate("doctorId", "firstName lastName image")
      .populate("doctorId", "firstName lastName image")
      .populate(
        "userId",
        "firstName lastName image email gender phone weight height blood_group blood_genotype marital_status kin_firstName kin_lastName kin_address kin_state kin_phone kin_email kin height blood_group blood_genotype marital_status kin_firstName kin_lastName kin_address kin_state kin_phone"
      )
      .exec();
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const addRviews = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    const hospitatId = req.hospital._id;
    const doctorId = req.doctor._id;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing details, please fill all required fields",
      });
    }
    const reviewData = {
      firstName,
      lastName,
      email,
      message,
      doctorId,
      hospitatId,
    };
    const review = new review(reviewData);
    await review.save();
    res.json({
      success: true,
      reviewData,
      message: "Review sent successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
