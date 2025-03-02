import { Brain } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const AIChatButton = () => {
  const { authUser } = useAuthStore();
  const { startAIChat } = useChatStore();

  if (!authUser?.aiChatEnabled) return null;

  return (
    <button
      onClick={startAIChat}
      className="flex flex-col items-center gap-1 p-3 hover:bg-base-300 rounded-lg transition-colors"
    >
      <div className="relative mx-auto">
        <div className="size-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
          <Brain className="size-6 text-white" />
        </div>
      </div>
      <span className="text-sm font-medium">ChatMate AI</span>
    </button>
  );
};

export default AIChatButton;