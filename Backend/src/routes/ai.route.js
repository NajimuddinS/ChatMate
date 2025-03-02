import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessageToAI, toggleAIChat } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", protectRoute, sendMessageToAI);
router.post("/toggle", protectRoute, toggleAIChat);

export default router;