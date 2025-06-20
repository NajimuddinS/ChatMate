import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { BsSend } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Get everything needed from the chat store
  const { selectedUser, sendMessage, sendMessageToAI } = useChatStore();

  const clearForm = () => {
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Check if there's content to send
    if (!text.trim() && !imagePreview) return;
    
    // Check if user is selected
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    setIsLoading(true);

    try {
      if (selectedUser.email === "ai@chatmate.com") {
        // AI chat doesn't support images
        if (imagePreview) {
          toast.error("Images can't be sent to AI assistant");
          setIsLoading(false);
          return;
        }
        
        // Send message to AI
        await sendMessageToAI(text.trim());
      } else {
        // Regular user chat
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });
      }

      // Clear form after successful send
      clearForm();
      
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const isAIChat = selectedUser?.email === "ai@chatmate.com";

  return (
    <form onSubmit={handleSendMessage} className="px-4 my-3">
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative w-20 h-20 mb-2">
          <img
            src={imagePreview}
            alt="Selected image"
            className="w-full h-full object-cover rounded-md border"
          />
          <button
            type="button"
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
            onClick={removeImage}
            title="Remove image"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Container */}
      <div className="w-full flex items-center gap-2">
        {/* Attachment Button - Only show for non-AI chats */}
        {selectedUser && !isAIChat && (
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            disabled={isLoading}
          >
            <ImAttachment className="w-4 h-4" />
          </button>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
        />

        {/* Text Input */}
        <input
          type="text"
          placeholder={isAIChat ? "Ask AI anything..." : "Send a message..."}
          className="input input-bordered rounded-full flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          autoComplete="off"
        />

        {/* Send Button */}
        <button 
          type="submit" 
          className={`btn btn-circle btn-primary text-white transition-all ${
            isLoading ? 'loading' : ''
          } ${(!text.trim() && !imagePreview) ? 'btn-disabled opacity-50' : 'hover:scale-105'}`}
          disabled={(!text.trim() && !imagePreview) || isLoading}
          title="Send message"
        >
          {!isLoading && <BsSend className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Chat Hint */}
      {isAIChat && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          Press Enter to send • Images not supported in AI chat
        </div>
      )}
    </form>
  );
};

export default MessageInput;