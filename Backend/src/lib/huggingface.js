// src/lib/huggingface.js
import axios from "axios";
import { config } from "dotenv";

config();

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/";
const MODEL_NAME = "deepseek-ai/DeepSeek-R1"; // You can change this to any model you prefer

// Check if the API key exists
const API_KEY = process.env.HUGGING_FACE_API_KEY;
if (!API_KEY) {
  console.error("HUGGING_FACE_API_KEY is not set in your environment");
}

export const huggingFaceClient = axios.create({
  baseURL: HUGGING_FACE_API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60000, // Set a longer timeout (60 seconds)
});

export const generateAIResponse = async (message) => {
  try {
    console.log("Sending request to Hugging Face API for:", message);
    
    // Format the message properly for LLaMA 2 Chat models
    const formattedMessage = `<s>[INST] ${message} [/INST]</s>`;
    
    const response = await huggingFaceClient.post(MODEL_NAME, {
      inputs: formattedMessage,
      parameters: {
        max_length: 500,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,
      },
    });
    
    // Check if we got a valid response
    if (response.data && response.data[0] && response.data[0].generated_text) {
      console.log("Response received from Hugging Face");
      return response.data[0].generated_text;
    }
    
    console.error("Unexpected response format:", response.data);
    return "I received your message but couldn't generate a proper response. Please try again.";
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      if (error.response.status === 503) {
        // Model is loading
        return "The AI model is still loading. Please try again in a moment.";
      }
      
      if (error.response.status === 401) {
        // Authentication error
        return "There's an issue with the AI service authentication. Please contact the administrator.";
      }
    }
    
    return "Sorry, I couldn't process your request at the moment. Please try again later.";
  }
};
