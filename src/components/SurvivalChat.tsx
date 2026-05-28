import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, ShieldAlert, Terminal } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function SurvivalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Namaste! I am **SafeNepal-Gurkha**, your real-time crisis response AI intelligence. Ask me about immediate survival safety steps, high-altitude landslide protocols, river inundation escapes, or first-aid checklists in English or Nepali / Neplish."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMsg = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatHistory.slice(-6) // Keep last 6 exchanges to manage context cleanly
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive satellite AI relay link.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", content: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "❌ **Sat-Link Error**: Failed to query remote safety relays. Please follow standard emergency safety signals or phone official police dispatch (100) immediately."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setInputValue(q);
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-none p-5 flex flex-col h-full" id="survival-chat-card">
      <div className="border-b-2 border-orange-600 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
            <Terminal className="h-5 w-5 text-orange-600" />
            SafeNepal Guard AI
          </h2>
          <p className="text-[10px] font-mono text-white/40 tracking-wider">REALTIME BI-LINGUAL CRISIS COUNSELOR</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-600/10 border border-orange-600/30 text-orange-500 font-mono text-[9px] font-bold">
          <Sparkles className="h-3 w-3 animate-pulse" />
          GEMINI CORE 3.5
        </span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto mb-4 p-3 bg-black space-y-4 max-h-[300px] border border-white/5 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            
            {m.role === "model" && (
              <div className="h-7 w-7 bg-orange-600 flex items-center justify-center shrink-0">
                <Terminal className="h-4 w-4 text-black" />
              </div>
            )}

            <div className={`p-3 max-w-[85%] text-xs leading-relaxed font-mono whitespace-pre-line ${
              m.role === "user" 
                ? "bg-white/10 border border-white/10 text-white" 
                : "bg-white/[0.03] border border-white/5 text-white/90"
            }`}>
              {m.content}
            </div>

            {m.role === "user" && (
              <div className="h-7 w-7 bg-white/25 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 bg-orange-600 flex items-center justify-center shrink-0 animate-pulse">
              <Terminal className="h-4 w-4 text-black" />
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/5 text-white/50 text-xs font-mono animate-pulse">
              Synthesizing response plans. Standard emergency lines are accessible...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Crisis Prompts */}
      <div className="mb-3.5">
        <span className="text-[9px] font-mono text-white/40 block mb-1.5 uppercase tracking-widest">Immediate Telemetry Queries:</span>
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => handleQuickQuestion("Our path is blocked by landslide. What immediately should we do? (पहिरो सुरक्षा)")}
            className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 transition-colors cursor-pointer"
          >
            🏔️ Landslide Steps
          </button>
          <button 
            onClick={() => handleQuickQuestion("River levels are rising near my fields in Terai plains. How to stay safe? (बाढी सतर्कता)")}
            className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 transition-colors cursor-pointer"
          >
            🌊 River Flooding
          </button>
          <button 
            onClick={() => handleQuickQuestion("Earthquake drop cover hold guidelines and local helpline numbers (भूकम्प सुरक्षा)")}
            className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/85 transition-colors cursor-pointer"
          >
            🚨 Earthquake Drill
          </button>
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask SafeNepal AI (Type in English or नेपाली)..."
          className="flex-1 bg-black text-white text-xs border border-white/20 p-2.5 focus:border-orange-500 focus:outline-none placeholder-white/30"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="bg-orange-600 hover:bg-white text-black font-black px-4 transition-colors p-2.5 cursor-pointer disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
