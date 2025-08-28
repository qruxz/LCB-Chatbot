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
    const threshold = 80;
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
    "How does it reduce irrigation?",
  ];

  // Server check
  useEffect(() => {
    const checkServerStatus = async () => {
      const isOnline = await checkHealth();
      setIsServerOnline(isOnline);
      if (!isOnline) {
        toast.error("AI server is currently offline. Please try again later.");
      }
    };

    checkServerStatus();
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
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get response. Please try again later.");
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
    <section className="px-6 pb-12 font-poppins">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-2 border-emerald-500 rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-500 p-6 border-b border-emerald-600 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Bot className="text-emerald-600" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-montserrat font-bold">
                  Hey I am LCB ChatBot! Ask Any Queries
                </h2>
                <p className="text-sm font-poppins">Get instant answers</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isServerOnline ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-sm font-poppins">
                  {isServerOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4 bg-white"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-emerald-100 rounded-2xl px-4 py-3 max-w-xs text-emerald-600 font-poppins">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-emerald-500">
            <div className="flex gap-3 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="bg-white border border-emerald-400 text-emerald-700 placeholder:text-emerald-400 rounded-xl font-poppins"
                disabled={isLoading || !isServerOnline}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || !isServerOnline}
                className="rounded-xl px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-montserrat"
              >
                <ArrowRight size={18} />
              </Button>
            </div>

            {/* Predefined Questions */}
            <div className="space-y-3">
              <p className="text-sm text-emerald-600 font-montserrat">
                Try asking:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {predefinedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(question)}
                    disabled={isLoading || !isServerOnline}
                    className="text-xs text-left justify-start bg-white border border-emerald-400 text-emerald-700 hover:bg-emerald-100 transition-all duration-200 rounded-xl font-poppins"
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
