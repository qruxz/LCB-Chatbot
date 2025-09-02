import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatSection from "@/components/ChatSection";

const Index = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-950">
      {/* Background animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse animation-delay-4000"
          style={{ animationDuration: "10s" }}
        />
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="py-6 px-6">
          <nav className="max-w-6xl mx-auto">
            <div className="flex space-x-8">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-green-400 border-b-2 border-green-400 pb-1"
                    : "text-white hover:text-green-200"
                }`}
              >
                Chat
              </Link>
            </div>
          </nav>
        </header>

        {/* Floating Chatbot Button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 left-6 w-16 h-16 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
          >
            💬
          </button>
        )}

        {/* Fullscreen Chat Window */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-950 via-green-900 to-green-950">
            {/* Close Button */}
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-4 right-4 text-white bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg"
            >
              ✕ Close
            </button>

            {/* Chat Section */}
            <ChatSection />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
