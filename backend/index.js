import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I am coding from backend",
    success: true,
  });
});

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5153",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Route

app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening at port ${PORT}`);
});
