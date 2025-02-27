import { format } from 'date-fns';

function ChatMessage({ message, isOwn }) {
  return (
    <div className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
      <div className="message-content">
        <p>{message.text}</p>
        <span className="message-time">
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}

export default ChatMessage;