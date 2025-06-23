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

  // Improved image compression function
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          },
          'image/jpeg', // Convert all images to JPEG for consistency
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - be more specific about supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Initial file size check (increased limit)
    const maxSize = 10 * 1024 * 1024; // 10MB initial limit
    if (file.size > maxSize) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);
      
      // Compress the image
      const compressedDataUrl = await compressImage(file);
      
      // Check compressed size (base64 is ~33% larger than binary)
      const compressedSize = (compressedDataUrl.length * 0.75); // Approximate binary size
      const finalMaxSize = 5 * 1024 * 1024; // 5MB final limit
      
      if (compressedSize > finalMaxSize) {
        // Try with lower quality
        const moreCompressedDataUrl = await compressImage(file, 1280, 720, 0.6);
        const moreCompressedSize = (moreCompressedDataUrl.length * 0.75);
        
        if (moreCompressedSize > finalMaxSize) {
          toast.error("Image is too large even after compression. Please use a smaller image.");
          return;
        }
        
        setImagePreview(moreCompressedDataUrl);
      } else {
        setImagePreview(compressedDataUrl);
      }
      
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image. Please try another image.");
    } finally {
      setIsLoading(false);
    }
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
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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