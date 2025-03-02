import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { BsSend } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Get everything needed from the chat store
  const { selectedUser, sendMessage, sendMessageToAI } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      if (selectedUser.email === "ai@chatmate.com") {
        // AI chat doesn't support images
        if (imagePreview) {
          toast.error("Images can't be sent to AI assistant");
          return;
        }
        
        await sendMessageToAI(text.trim());
      } else {
        // Regular chat
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSendMessage} className="px-4 my-3">
      {imagePreview && (
        <div className="relative w-20 h-20 mb-2">
          <img
            src={imagePreview}
            alt="Selected image"
            className="w-full h-full object-cover rounded-md"
          />
          <button
            type="button"
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 text-xs"
            onClick={() => {
              setImagePreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            X
          </button>
        </div>
      )}
      <div className="w-full flex items-center gap-2">
        {selectedUser && selectedUser.email !== "ai@chatmate.com" && (
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => fileInputRef.current.click()}
          >
            <ImAttachment />
          </button>
        )}
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <input
          type="text"
          placeholder="Send a message..."
          className="input input-bordered rounded-full flex-grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-circle btn-primary text-white">
          <BsSend />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;