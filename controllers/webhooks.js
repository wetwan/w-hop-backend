import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Clerk Webhook Secret is missing!");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error." });
    }

    const whook = new Webhook(webhookSecret);

    // Verify Webhook Signature
    try {
      whook.verify(req.rawBody, {
        "svix-id": req.headers["svix-id"] || "",
        "svix-timestamp": req.headers["svix-timestamp"] || "",
        "svix-signature": req.headers["svix-signature"] || "",
      });
    } catch (error) {
      console.error("Webhook verification failed:", error.message);
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature." });
    }

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const existingUser = await User.findById(data.id);
        if (existingUser) {
          return res.json({ success: false, message: "User already exists." });
        }

        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          image: data.image_url,
          phone: "",
          address: "",
          state: "",
          gender: "",
          dob: "",
          height: "",
          weight: "",
          blood_group: "",
          blood_genotype: "",
          marital_status: "",
          kin_firstName: "",
          kin_lastName: "",
          kin_address: "",
          kin_state: "",
          kin_phone: "",
          kin_email: "",
          kin_gender: "",
          kin_relationship: "",
        };
        await User.create(userData);
        return res.json({ success: true, message: "User created." });
      }

      case "user.updated": {
        const updatedUser = await User.findByIdAndUpdate(
          data.id,
          {
            image: data.image_url,
            phone: "",
            address: "",
            state: "",
            height: "",
            weight: "",
            marital_status: "",
            kin_firstName: "",
            kin_lastName: "",
            kin_address: "",
            kin_state: "",
            kin_phone: "",
            kin_email: "",
            kin_gender: "",
            kin_relationship: "",
          },
          { new: true }
        );

        if (!updatedUser) {
          return res.json({ success: false, message: "User not found." });
        }

        return res.json({ success: true, message: "User updated." });
      }

      case "user.deleted": {
        const deletedUser = await User.findByIdAndDelete(data.id);
        if (!deletedUser) {
          return res.json({ success: false, message: "User not found." });
        }
        return res.json({ success: true, message: "User deleted." });
      }

      default:
        return res
          .status(400)
          .json({ success: false, message: "Unknown event type." });
    }
  } catch (error) {
    console.error("Webhook Processing Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Webhook processing failed." });
  }
};
