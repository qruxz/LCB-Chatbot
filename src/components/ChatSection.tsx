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

const LCB_GREEN = "rgb(148,191,115)";
const LCB_GREEN_DARK = "rgb(148,191,115)";
const LCB_GREEN_SOFT = "#EAF8EE";

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

  // 👇 NEW: Language state
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // 👇 NEW: Follow-up suggestions state
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const chipsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // English follow-up questions
  const englishQuestions = [
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
    "What is the cost of Navyakosh?",
    "How much quantity should I use?",
    "When should I apply the fertilizer?",
    "What are the soil requirements?",
    "How long does it take to show results?",
    "Is it suitable for organic farming?",
    "What is the shelf life?",
    "How to store Navyakosh properly?",
    "Can it be mixed with other fertilizers?",
    "What are the main ingredients?",
    "How does weather affect application?",
    "What crops benefit most from Navyakosh?",
    "How often should I apply it?",
    "What is the application method for different crops?",
    "Does it work in all soil types?"
  ];

  // Hindi follow-up questions
  const hindiQuestions = [
    "नव्याकोश जैविक उर्वरक क्या है?",
    "नव्याकोश उपयोग करने के क्या फायदे हैं?",
    "गेहूं, मक्का और धान के लिए इसे कैसे लगाएं?",
    "क्या यह मिट्टी के स्वास्थ्य के लिए सुरक्षित है?",
    "क्या यह रासायनिक उर्वरकों की जगह ले सकता है?",
    "यह फसल की पैदावार कैसे बढ़ाता है?",
    "मुझे किस प्रकार के परिणामों की उम्मीद करनी चाहिए?",
    "यह किन फसलों पर इस्तेमाल हो सकता है?",
    "नव्याकोश कहाँ से खरीद सकते हैं?",
    "यह सिंचाई कैसे कम करता है?",
    "नव्याकोश की कीमत क्या है?",
    "कितनी मात्रा में उपयोग करना चाहिए?",
    "उर्वरक कब लगाना चाहिए?",
    "मिट्टी की क्या आवश्यकताएं हैं?",
    "परिणाम दिखने में कितना समय लगता है?",
    "क्या यह जैविक खेती के लिए उपयुक्त है?",
    "इसकी शेल्फ लाइफ कितनी है?",
    "नव्याकोश को सही तरीके से कैसे स्टोर करें?",
    "क्या इसे अन्य उर्वरकों के साथ मिलाया जा सकता है?",
    "मुख्य सामग्री क्या हैं?",
    "मौसम लगाने को कैसे प्रभावित करता है?",
    "कौन सी फसलों को नव्याकोश से सबसे ज्यादा फायदा होता है?",
    "कितनी बार लगाना चाहिए?",
    "विभिन्न फसलों के लिए लगाने का तरीका क्या है?",
    "क्या यह सभी प्रकार की मिट्टी में काम करता है?"
  ];

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

  // 👇 NEW: Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setFollowUpSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const currentQuestions = language === "en" ? englishQuestions : hindiQuestions;
    const filtered = currentQuestions.filter((question) =>
      question.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 5); // Show max 5 suggestions

    setFollowUpSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [inputValue, language]);

  // 👇 NEW: Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || followUpSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < followUpSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selectedSuggestion = followUpSuggestions[selectedSuggestionIndex];
      setInputValue(selectedSuggestion);
      setShowSuggestions(false);
      handleSendMessage(selectedSuggestion);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // 👇 NEW: Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    handleSendMessage(suggestion);
  };

  // 👇 NEW: Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const predefinedQuestions = language === "en" ? englishQuestions.slice(0, 10) : hindiQuestions.slice(0, 10);

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
    setShowSuggestions(false); // 👇 Hide suggestions after sending
    setIsLoading(true);
    requestAnimationFrame(scrollChatToBottom);

    try {
      // 👇 pass language to backend
      const response = await sendMessage(messageText, language);

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
    if (e.key === "Enter" && !e.shiftKey && selectedSuggestionIndex === -1) {
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
            className="p-4 sm:p-6 text-white border-b flex justify-between items-center"
            style={{ backgroundColor: LCB_GREEN, borderColor: LCB_GREEN_DARK }}
          >
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
                  {language === "en" ? "Ask about Navyakosh" : "नव्याकोश के बारे में पूछें"}
                </p>
              </div>
            </div>

            {/* 👇 Language Toggle */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded ${
                  language === "en" ? "bg-white text-green-700 font-bold" : "bg-transparent text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2 py-1 rounded ${
                  language === "hi" ? "bg-white text-green-700 font-bold" : "bg-transparent text-white"
                }`}
              >
                हिंदी
              </button>
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
                  {language === "en" ? "Typing..." : "टाइप कर रहे हैं..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input + Suggestions + Chips */}
          <div className="p-4 sm:p-6 bg-white border-t relative" style={{ borderColor: LCB_GREEN }}>
            {/* 👇 NEW: Follow-up Suggestions Dropdown */}
            {showSuggestions && followUpSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute bottom-full left-4 right-4 sm:left-6 sm:right-6 mb-2 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto z-10"
                style={{ borderColor: LCB_GREEN }}
              >
                {followUpSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 font-poppins text-sm ${
                      selectedSuggestionIndex === index ? 'bg-gray-50' : ''
                    }`}
                    style={{
                      color: selectedSuggestionIndex === index ? LCB_GREEN_DARK : '#374151'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown} // 👇 NEW: Handle arrow keys
                placeholder={language === "en" ? "Type your question..." : "अपना प्रश्न टाइप करें..."}
                className="flex-1 bg-white rounded-xl font-poppins"
                style={{
                  borderColor: LCB_GREEN,
                  color: "#166534",
                }}
                disabled={isLoading || !isServerOnline}
                autoComplete="off"
              />
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim() || !isServerOnline}
                className="rounded-xl px-4 sm:px-6 text-white font-montserrat"
                style={{ backgroundColor: LCB_GREEN }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor = LCB_GREEN_DARK)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.backgroundColor = LCB_GREEN)
                }
              >
                <ArrowRight size={18} />
              </Button>
            </div>

            {/* Chips */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-montserrat" style={{ color: LCB_GREEN_DARK }}>
                {language === "en" ? "Try asking:" : "पूछने की कोशिश करें:"}
              </p>

              <div className="relative">
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

                <div
                  ref={chipsRef}
                  onScroll={updateChipsScrollState}
                  className="flex gap-2 overflow-x-auto snap-x snap-mandatory pr-2 pl-2 sm:pl-8 sm:pr-8 items-stretch"
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
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 0px;
        }
      `}</style>
    </section>
  );
};

export default ChatSection;
