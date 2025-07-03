// src/lib/huggingface.js
import axios from "axios";
import { config } from "dotenv";
config();

// Groq API configuration
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant"; // Fast and reliable model

// Check if the API key exists
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set in your environment");
}

// Create Groq client
export const groqClient = axios.create({
  baseURL: GROQ_API_URL,
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

export const generateAIResponse = async (message, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    console.log("Sending request to Groq API for:", message);
    
    const response = await groqClient.post("", {
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false,
    });
    
    // Check if we got a valid response
    if (response.data && response.data.choices && response.data.choices[0]) {
      const aiResponse = response.data.choices[0].message.content.trim();
      console.log("✅ Response received from Groq API");
      return aiResponse;
    }
    
    console.error("Unexpected response format:", response.data);
    return "I received your message but couldn't generate a proper response. Please try again.";
    
  } catch (error) {
    console.error("Error generating AI response:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      if (error.response.status === 429) {
        // Rate limit exceeded
        if (retryCount < maxRetries) {
          console.log(`Rate limit hit, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          return generateAIResponse(message, retryCount + 1);
        }
        return "I'm being rate limited. Please wait a moment and try again.";
      }
      
      if (error.response.status === 401) {
        return "There's an issue with the API key authentication. Please check your Groq API key.";
      }
      
      if (error.response.status === 400) {
        return "There was an issue with your request. Please try rephrasing your message.";
      }
      
      if (error.response.status >= 500) {
        // Server error - retry
        if (retryCount < maxRetries) {
          console.log(`Server error, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
          return generateAIResponse(message, retryCount + 1);
        }
        return "The AI service is temporarily unavailable. Please try again later.";
      }
    }
    
    if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
      console.log(`Request timed out, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return generateAIResponse(message, retryCount + 1);
    }
    
    return "Sorry, I couldn't process your request at the moment. Please try again later.";
  }
};

// Alternative models you can use by changing GROQ_MODEL:
// "llama-3.1-70b-versatile" - More powerful but slower
// "llama-3.1-8b-instant" - Fast and efficient (current)
// "mixtral-8x7b-32768" - Good for longer conversations
// "gemma-7b-it" - Google's Gemma model

// Function to test the API connection
export const testGroqConnection = async () => {
  try {
    const response = await generateAIResponse("Hello, can you hear me?");
    console.log("✅ Groq API connection test successful");
    return { success: true, response };
  } catch (error) {
    console.error("❌ Groq API connection test failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Function to get available models (optional)
export const getAvailableModels = async () => {
  try {
    const response = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
    });
    
    return response.data.data.map(model => model.id);
  } catch (error) {
    console.error("Error fetching available models:", error.message);
    return [];
  }
};