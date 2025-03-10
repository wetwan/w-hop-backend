import "./config/instrument.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from "./controllers/webhooks.js";
import connectCloudinary from "./config/cloudinary.js";
import hospitalRouter from "./routes/hospitalRoutes.js";
import DoctorRouter from "./routes/doctorRoutes.js";
import router from "./routes/userRoute.js";
import {clerkMiddleware} from '@clerk/express'

// initislize Express
const app = express();

// connect to db
await connectDB();
connectCloudinary();

// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

//route
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", (req, res) => {
  throw new Error("my first error");
});
app.use(express.raw({ type: "application/json" }));
app.post("/webhooks", clerkWebhooks);

// endpoint API

// localhost:5000/api/hospital/

app.use("/api/hospital", hospitalRouter);
app.use("/api/doctor", DoctorRouter);
app.use("/api/user", router);

// port
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
