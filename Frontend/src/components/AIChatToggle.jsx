import { Brain } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AIChatToggle = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [isToggling, setIsToggling] = useState(false);

  const toggleAIChat = async () => {
    try {
      setIsToggling(true);
      const res = await axiosInstance.post("/ai/toggle");
      setAuthUser({ ...authUser, aiChatEnabled: res.data.aiChatEnabled });
      toast.success(
        res.data.aiChatEnabled ? "AI chat enabled" : "AI chat disabled"
      );
    } catch (error) {
      toast.error("Failed to toggle AI chat");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={toggleAIChat}
      disabled={isToggling}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        authUser?.aiChatEnabled
          ? "bg-emerald-100 text-emerald-700"
          : "bg-base-200 text-base-content/70"
      }`}
    >
      <Brain className="size-4" />
      <span className="text-sm">
        {authUser?.aiChatEnabled ? "AI Enabled" : "AI Disabled"}
      </span>
    </button>
  );
};

export default AIChatToggle;