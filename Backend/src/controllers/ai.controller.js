import { generateAIResponse } from "../lib/huggingface.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

// The AI assistant's ID (we'll create this user in the database)
const AI_USER_ID = process.env.AI_USER_ID || "ai-assistant";

export const setupAIUser = async () => {
  try {
    // Check if AI user exists
    let aiUser = await User.findOne({ email: "ai@chatmate.com" });

    // If not, create it
    if (!aiUser) {
      aiUser = new User({
        email: "ai@chatmate.com",
        fullName: "ChaTai",
        password: await bcrypt.hash(
          Math.random().toString(36) + Date.now().toString(36),
          10
        ),
        profilePic:
          "./ChatAi.jpg", // Add an AI avatar image to your public folder
      });
      await aiUser.save();
      console.log("AI assistant account created with ID:", aiUser._id);
    }

    return aiUser._id;
  } catch (error) {
    console.error("Error setting up AI user:", error);
    return null;
  }
};

export const sendMessageToAI = async (req, res) => {
  try {
    const { text } = req.body;
    const senderId = req.user._id;

    // Get or create AI user
    const aiUser = await User.findOne({ email: "ai@chatmate.com" });
    if (!aiUser) {
      return res.status(500).json({ error: "AI assistant not configured" });
    }

    // Save user message
    const userMessage = new Message({
      senderId,
      receiverId: aiUser._id,
      text,
    });
    await userMessage.save();

    // Generate AI response
    const aiResponse = await generateAIResponse(text);

    // Save AI response
    const aiMessage = new Message({
      senderId: aiUser._id,
      receiverId: senderId,
      text: aiResponse,
    });
    await aiMessage.save();

    // Return both messages
    res.status(200).json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    console.error("Error in AI message controller:", error);
    res.status(500).json({ error: "Failed to process AI message" });
  }
};

export const toggleAIChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    user.aiChatEnabled = !user.aiChatEnabled;
    await user.save();

    res.status(200).json({ aiChatEnabled: user.aiChatEnabled });
  } catch (error) {
    console.error("Error toggling AI chat:", error);
    res.status(500).json({ error: "Failed to toggle AI chat" });
  }
};
