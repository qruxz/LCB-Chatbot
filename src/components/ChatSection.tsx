"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { sendMessage, checkHealth } from "@/utils/api";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const LCB_GREEN = "rgb(148,191,115)";      // light green
const LCB_GREEN_DARK = "rgb(148,191,115)"; // hover/border darker
const LCB_GREEN_SOFT = "#EAF8EE"; // pale bg for typing chip

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

  // chips scroller refs/state
  const chipsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
    if (isNearBottom()) scrollChatToBottom();
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

  // chips scroll helpers
  const updateChipsScrollState = () => {
    const el = chipsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateChipsScrollState();
    const onResize = () => updateChipsScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollChips = (dir: "left" | "right") => {
    const el = chipsRef.current;
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

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
    <section className="px-4 sm:px-6 pb-12 font-poppins">
      <div className="max-w-5xl mx-auto">
        <div
          className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[80vh] border-2"
          style={{ borderColor: LCB_GREEN }}
        >
          {/* Header */}
          <div
            className="p-4 sm:p-6 text-white border-b"
            style={{ backgroundColor: LCB_GREEN, borderColor: LCB_GREEN_DARK }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <img
              src="https://static.wixstatic.com/media/9f521c_3889887a159a4d15b348c18ed3a8b49c~mv2.jpeg/v1/crop/x_24,y_43,w_579,h_579/fill/w_80,h_80,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/LCB%20Fertilizers.jpeg"
              alt="LCB Logo"
              className="w-12 h-12 rounded-full object-cover"
            />

                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-montserrat font-bold">
                    LCB ChatBot 🌱
                  </h2>
                  <p className="text-xs sm:text-sm font-poppins">
                    Ask about Navyakosh
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isServerOnline ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-xs sm:text-sm font-poppins">
                  {isServerOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-2 max-w-xs font-poppins"
                  style={{ backgroundColor: LCB_GREEN_SOFT, color: LCB_GREEN_DARK }}
                >
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input + One-row chips carousel */}
          <div className="p-4 sm:p-6 bg-white border-t" style={{ borderColor: LCB_GREEN }}>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 bg-white rounded-xl font-poppins"
                style={{
                  borderColor: LCB_GREEN,
                  color: "#166534",
                }}
                disabled={isLoading || !isServerOnline}
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || !isServerOnline}
                className="rounded-xl px-4 sm:px-6 text-white font-montserrat"
                style={{ backgroundColor: LCB_GREEN }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    LCB_GREEN_DARK)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    LCB_GREEN)
                }
              >
                <ArrowRight size={18} />
              </Button>
            </div>

            {/* Single-row horizontal scroller with arrows */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-montserrat" style={{ color: LCB_GREEN_DARK }}>
                Try asking:
              </p>

              <div className="relative">
                {/* Left Arrow */}
                <button
                  aria-label="Scroll left"
                  onClick={() => scrollChips("left")}
                  disabled={!canScrollLeft}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow ${
                    canScrollLeft ? "opacity-100" : "opacity-40 cursor-not-allowed"
                  } hidden sm:flex`}
                  style={{ backgroundColor: LCB_GREEN, color: "white" }}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Chips track */}
                <div
                  ref={chipsRef}
                  onScroll={updateChipsScrollState}
                  className="flex gap-2 overflow-x-auto snap-x snap-mandatory pr-2 pl-2 sm:pl-8 sm:pr-8 items-stretch"
                  style={{
                    // hide scrollbar for webkit; safe to keep if you prefer showing
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {predefinedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      disabled={isLoading || !isServerOnline}
                      className="shrink-0 snap-start rounded-full text-xs sm:text-sm px-3 sm:px-4 py-2 border transition-all hover:shadow"
                      style={{
                        borderColor: LCB_GREEN,
                        color: LCB_GREEN_DARK,
                        background: "white",
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  aria-label="Scroll right"
                  onClick={() => scrollChips("right")}
                  disabled={!canScrollRight}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow ${
                    canScrollRight ? "opacity-100" : "opacity-40 cursor-not-allowed"
                  } hidden sm:flex`}
                  style={{ backgroundColor: LCB_GREEN, color: "white" }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* hide scrollbars for chips (component-scoped) */}
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 0px;
        }
      `}</style>
    </section>
  );
};

export default ChatSection;
