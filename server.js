import "./config/instrument.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from "./controllers/webhooks.js";

// initislize Express
const app = express();

// connect to db
await connectDB();

// middleware
app.use(cors());
app.use(express.json());

//route
app.get("/", (req, res) => res.send("API Working"));
app.get("/debug-sentry", (req, res) => {
  throw new Error("my first error");
});
app.use(express.raw({ type: "application/json" })); 
app.post("/webhooks", clerkWebhooks);

// port
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
