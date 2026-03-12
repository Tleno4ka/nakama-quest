import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Привет! Я AI-ассистент Nakama. Могу помочь с советами по играм, стратегиями, подбором билдов или ответить на любые вопросы по гейминг-тематике. Спрашивай!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Это демо-режим AI-ассистента. После подключения Lovable Cloud он будет давать настоящие ответы с помощью ИИ!",
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20">
          <Bot className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">AI-ассистент</p>
          <p className="text-xs text-muted-foreground">Советы, стратегии, аналитика</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.15s" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Спроси что-нибудь..."
            className="flex-1 rounded-xl bg-input px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus"
          />
          <Button variant="default" size="icon" onClick={sendMessage} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
