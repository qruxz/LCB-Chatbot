import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bot, AlertCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { sendMessage, checkHealth } from "@/utils/api";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "LCB Fertilizer's Query Window. Ask me any queries you have!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = (): boolean => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const threshold = 80; // px
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollChatToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    // Only auto-scroll if user is near bottom (reading latest) to avoid jumping to Get In Touch
    if (isNearBottom()) {
      scrollChatToBottom();
    }
  }, [messages]);

const predefinedQuestions = [
  "What is Navyakosh Organic Fertilizer?",
  "What are the benefits of using Navyakosh?",
  "How do I apply it for Wheat, Maize, and Paddy?",
  "Is it safe for long-term soil health?",
  "Can it replace chemical fertilizers?",
  "How does it improve crop yield?",
  "What kind of results can I expect?",
  "On which crops can it be used?",
  "Where can I buy Navyakosh?",
  "How does it reduce irrigation?"
];


  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      const isOnline = await checkHealth();
      setIsServerOnline(isOnline);
      if (!isOnline) {
        toast.error("AI server is currently offline. Please try again later.");
      }
    };

    checkServerStatus();
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    if (!isServerOnline) {
      toast.error("AI server is currently offline. Please try again later.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    // When the sender is the user, always scroll the chat container to bottom
    requestAnimationFrame(scrollChatToBottom);

    try {
      const response = await sendMessage(messageText);
      
      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        toast.error("Failed to get response. Please try again.");
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response || "Sorry, I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response. Please try again later.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <section className="px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 p-6 border-b border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">Hey I am LCB ChatBot! Ask Any Queries</h2>
                <p className="text-slate-300">Get instant answers</p>
              </div>
              {/* Server Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isServerOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-slate-300">
                  {isServerOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Server Status Alert */}
            {!isServerOnline && (
              <div className="bg-red-500/20 rounded-2xl p-4 backdrop-blur-sm border border-red-500/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-400" size={20} />
                  <p className="text-sm text-red-300">
                    AI server is currently offline. Please try again later.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div ref={scrollContainerRef} className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900/30 border-t border-white/10">
            <div className="flex gap-3 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about my background..."
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-400 backdrop-blur-sm rounded-xl"
                disabled={isLoading || !isServerOnline}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || !isServerOnline}
                className="rounded-xl px-6 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
              >
                <ArrowRight size={18} />
              </Button>
            </div>

            {/* Predefined Questions */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {predefinedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading || !isServerOnline}
                    className="text-xs text-left justify-start bg-white/5 border-white/20 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-xl"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
