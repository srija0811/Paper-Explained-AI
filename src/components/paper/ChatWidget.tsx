import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Hi! Need help understanding a specific word or concept in this paper? Ask me here!" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userText }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      // Detect language based on script or keywords
      const isTelugu = /[\u0C00-\u0C7F]/.test(userText) || userText.toLowerCase().includes("telugu") || userText.toLowerCase().includes("ardham");
      const isHindi = /[\u0900-\u097F]/.test(userText) || userText.toLowerCase().includes("hindi") || userText.toLowerCase().includes("arth");

      let responseText = "";

      if (isTelugu) {
        responseText = `అర్థం: సులభం\nపర్యాయపదాలు: తేలిక, సామాన్యమైన\nవ్యతిరేక పదాలు: కష్టం, సంక్లిష్టమైన`;
      } else if (isHindi) {
        responseText = `अर्थ: सरल\nसमानार्थी: आसान, स्पष्ट\nविलोम: कठिन, जटिल`;
      } else {
        responseText = `Meaning: Simplified\nSynonyms: Easy, Clear\nAntonyms: Complex, Difficult`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: responseText,
        }
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-brand text-white shadow-xl hover:scale-105 transition-transform z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <Bot className="size-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 max-h-[500px] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl z-50 transition-all origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-accent" />
            <span className="font-semibold text-foreground">AI Research Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[300px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`shrink-0 size-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                {msg.sender === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === "user" ? "bg-gradient-brand text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground border border-border rounded-tl-sm"}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2 bg-surface rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a word..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button type="submit" disabled={!input.trim()} className="p-2.5 rounded-xl bg-gradient-brand text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shadow-md">
            <Send className="size-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
}
