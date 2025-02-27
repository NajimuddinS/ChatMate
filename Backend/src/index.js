import express from "express";
import dotenv from "dotenv"
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import cookieParser from 'cookie-parser'
import { connectDB } from "./lib/db.js";
import cors from 'cors';
dotenv.config()
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173"
}))
app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes)
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log("server is running on " + PORT);
  connectDB()
});
