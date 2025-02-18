import { Webhook } from "svix";
import User from "../models/User.js";

// api controller to manger clerk user with databse

export const clerkWebhooks = async (req, res) => {
  try {
    // svix insatnce with clerk
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SERECT);

    // VERIFY HEADER
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
    // geting data from req.body

    const { data, type } = req.body;

    // switch case for eevnt

    switch (type) {
      case "user.created": {
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
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
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
        await User.findByIdAndUpdate(data.id, userData);
        res.josn({});

        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.josn({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "WebHooks Error" });
  }
};