import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorMode.js";
import hospitalModel from "../models/hospitalModel.js";
import generateToken from "../utils/genrateToken.js";
import Appointment from "../models/appointment.js";
import mongoose from "mongoose";

//  Register a doctor
export const registerDoctor = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    field,
    website,
    College,
    experience,
    about,
    state,
    available,
    phone,
  } = req.body;

  try {
    const hospitatId = req.hospital._id;
    let experienceDate = null;
    if (experience) {
      experienceDate = new Date(experience);

      // Check if the date is valid
      if (isNaN(experienceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format for experience. Use YYYY-MM-DD",
        });
      }
    }

    const missingFields = [];

    if (!firstName) missingFields.push("firstName");
    if (!lastName) missingFields.push("lastName");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!field) missingFields.push("field");
    if (!website) missingFields.push("website");
    if (!College) missingFields.push("College");
    if (!experience) missingFields.push("experience");
    if (!about) missingFields.push("about");
    if (!state) missingFields.push("state");
    if (!phone) missingFields.push("phone");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing details: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password (min 8 characters)",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload images if provided
    const imageFile = req.files["image"] ? req.files["image"][0] : null;
    const bannerImageFile = req.files["bannerImage"]
      ? req.files["bannerImage"][0]
      : null;

    const imageUrl = await cloudinary.uploader.upload(imageFile.path);
    const bannerImageUrl = await cloudinary.uploader.upload(
      bannerImageFile.path
    );
    // Create doctor object
    const doctorData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      field,
      website,
      College,
      experience: experienceDate, // Store formatted date
      about,
      state,
      image: imageUrl.secure_url,
      bannerImage: bannerImageUrl.secure_url,
      date: Date.now(),
      hospitatId,
      available,
      phone,
    };

    // Save to database
    const doctor = new doctorModel(doctorData);
    await doctor.save();
    res.json({
      success: true,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        image: doctor.image,
        email: doctor.email,
        field: doctor.field,
        website: doctor.website,
        College: doctor.website,
        experience: doctor.experience,
        about: doctor.about,
        state: doctor.state,
        hospitatId,
        available,
      },
      token: generateToken(doctor._id),
      message: "Doctor created successfully",
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res.json({ success: false, message: error.message });
  }
};

//  register  Hospiatl

export const registerHospital = async (req, res) => {
  const { name, email, password } = req.body;
  const imageFile = req.file;

  if (!name || !email || !password || !imageFile) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const hospitalExists = await hospitalModel.findOne({ email });
    if (hospitalExists) {
      return res
        .status(409)
        .json({ success: false, message: "Hospital already registered" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password (min 8 characters)",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const hospital = await hospitalModel.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    res.status(201).json({
      // 201 Created
      success: true,
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        image: hospital.image,
        email: hospital.email,
      },
      token: generateToken(hospital._id),
      message: "Hospital created successfully",
      id: hospital._id,
    });
  } catch (error) {
    console.error("Register Hospital Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const { id } = req.body;
    const {
      name,
      type,
      website,
      state,
      address,
      phone,
      facility,
      ownership,
      about,
    } = req.body;
    const hospital = await hospitalModel.findById(id).select("-password");
    const imageFile = req.file;
    const otherImageFile = req.files["otherImages"]
      ? req.files["otherImages"][0]
      : null;
    const bannerImageFile = req.files["banner"] ? req.files["banner"][0] : null;

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: "Hospital not found" });
    }
    const facilitiesToAdd = Array.isArray(facility) ? facility : [facility];

    let updates = {
      name,
      type,
      website,
      address,
      phone,
      state,
      ownership,
      about,
    };
    if (facilitiesToAdd && facilitiesToAdd.length > 0) {
      updates.$push = { facility: { $each: facilitiesToAdd } };
    }
    if (bannerImageFile) {
      try {
        const uploadedBanner = await cloudinary.uploader.upload(
          bannerImageFile.path,
          { resource_type: "image" }
        );
        updates.banner = uploadedBanner.secure_url;
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

    if (otherImageFile) {
      try {
        const uploadedOther = await cloudinary.uploader.upload(
          otherImageFile.path,
          { resource_type: "image" }
        );
        updates.otherImages = uploadedOther.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary other image upload error:", cloudinaryError);
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

    if (hospital.image) {
      await cloudinary.uploader.destroy(hospital.image);
    }
    if (imageFile) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updates.image = uploadedImage.secure_url;
      } catch (cloudinaryImageError) {
        console.error("Cloudinary image upload error:", cloudinaryImageError);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

    const updatedHospital = await hospitalModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      hospital: updatedHospital,
    });
  } catch (error) {
    console.error("Update Hospital Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  login  Hospiatl

export const loginHospital = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (await bcrypt.compare(password, hospital.password)) {
      // Added await for bcrypt.compare
      res.json({
        success: true,
        hospital: {
          _id: hospital._id,
          name: hospital.name,
          email: hospital.email,
        },
        token: generateToken(hospital._id),
        message: "Loged in successfully",
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" }); // Corrected typo and status code
    }
  } catch (error) {
    res.json({ sucsess: false, message: error.message });
  }
};

//  get  Hospitaldata

export const getHospitalData = async (req, res) => {
  try {
    const hospital = req.hospital;

    res.json({ success: true, hospital });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//  get  HospitalDoctor

export const getHospitalDoctors = async (req, res) => {
  try {
    const hospitalId = req.hospitatId;
    // const doctors = await doctorModel.find({}).select("-password");
    const doctors = await doctorModel.find({ hospitalId }).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
//  get  HospitalDoctor

export const changeDoctorAvalibility = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    await docData.save();
    res.json({ sucsess: true, message: "Availablity changed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
export const hospitalprofile = async (req, res) => {
  try {
    const { id } = req.params;

    const hos = await hospitalModel.findById(id).select("-password");

    res.json({ success: true, hos });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

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
export const getHospital = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find().select("-password"); // ✅ Correct usage

    res.json({ success: true, hospitals });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getHopitalAppointment = async (req, res) => {
 
    try {
     const  hospital  = req.hospitalId;
     // Fetching appointments based on hospitalId
     const appointments = await Appointment.find({ hospital })
       .populate("hospitalId", "name image")
       .populate("doctorId", "firstName lastName image")
       .populate("userId", "firstName lastName image email gender phone weight height blood_group blood_genotype marital_status kin_firstName kin_lastName kin_address kin_state kin_phone kin_email")
       .exec();
 
     res.json({ success: true, appointments });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
 
};
