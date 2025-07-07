import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const isAIChat = selectedUser?.email === "ai@chatmate.com";

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                {isAIChat ? (
                  <>
                    <div className="text-4xl mb-2">🤖</div>
                    <p className="text-lg">Start chatting with AI</p>
                    <p className="text-sm">Ask me anything!</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className={`chat-bubble flex flex-col ${
                isAIChat && message.senderId !== authUser._id 
                  ? 'bg-secondary text-secondary-content' 
                  : ''
              }`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(message.image, '_blank')}
                  />
                )}
                {message.text && (
                  <div className={`${isAIChat && message.senderId !== authUser._id ? 'whitespace-pre-wrap' : ''}`}>
                    {isAIChat && message.senderId !== authUser._id ? (
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <div {...props} />, // Replace p with div
                          code({node, inline, className, children, ...props}) {
                            return inline ? (
                              <code className="bg-neutral rounded px-1 py-0.5 text-sm text-white">
                                {children}
                              </code>
                            ) : (
                              <div className="my-2"> {/* Wrap pre in div instead of p */}
                                <pre className="bg-neutral rounded p-2 overflow-x-auto text-white">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            );
                          }
                        }}
                      >
                        {message.text}
                      </Markdown>
                    ) : (
                      message.text
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;