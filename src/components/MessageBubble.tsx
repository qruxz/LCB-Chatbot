import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl font-poppins ${
          message.isUser
            ? "bg-emerald-500/20 text-emerald-900 border border-emerald-400 shadow-md"
            : "bg-white text-emerald-800 border border-emerald-300"
        }`}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        <p className={`text-xs mt-2 font-montserrat ${
          message.isUser ? "text-emerald-700" : "text-emerald-600"
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
