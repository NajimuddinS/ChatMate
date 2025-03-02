import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  aiUser: null, // You had this defined twice - removed the duplicate

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Socket not initialized");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().getMessages(selectedUser._id);
    }
  },
  
  startAIChat: async () => {
    try {
      // Find or fetch AI user
      let aiUser = get().users.find(user => user.email === "ai@chatmate.com");
      
      if (!aiUser) {
        // If AI user isn't in the users list, fetch users again
        await get().getUsers();
        aiUser = get().users.find(user => user.email === "ai@chatmate.com");
        
        if (!aiUser) {
          toast.error("AI assistant not available");
          return;
        }
      }
      
      // Set AI as selected user
      set({ selectedUser: aiUser, aiUser });
      
      // Get messages with AI
      get().getMessages(aiUser._id);
    } catch (error) {
      console.error("Failed to start AI chat:", error);
      toast.error("Failed to start AI chat");
    }
  },
  
  sendMessageToAI: async (text) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    if (selectedUser.email !== "ai@chatmate.com") {
      // Not chatting with AI
      return get().sendMessage({ text });
    }
    
    try {
      // Show user message immediately (optimistic UI)
      const tempUserMsg = {
        _id: Date.now().toString(),
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text,
        createdAt: new Date().toISOString(),
        temporary: true
      };
      
      set({ messages: [...messages, tempUserMsg] });
      
      // Call AI endpoint
      const res = await axiosInstance.post("/ai/chat", { text });
      
      // Replace temporary message and add AI response
      const updatedMessages = messages.filter(m => !m.temporary);
      set({ 
        messages: [
          ...updatedMessages, 
          res.data.userMessage, 
          res.data.aiMessage
        ] 
      });
    } catch (error) {
      console.error("Failed to send message to AI:", error);
      toast.error("Failed to send message to AI");
      // Remove temporary message on error
      set({ messages: messages.filter(m => !m.temporary) });
    }
  },
}));
