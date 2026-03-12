import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const mockMessages: Message[] = [
  { id: "1", sender: "them", text: "Привет! Видел что ты играешь в Dota 2. На какой позиции?", time: "20:31" },
  { id: "2", sender: "me", text: "Привет! Играю на 4-5, саппорт мейн. А ты?", time: "20:32" },
  { id: "3", sender: "them", text: "Керри/мид. Давай дуо попробуем? Сейчас 5200 MMR", time: "20:33" },
];

const contacts = [
  { id: "2", nickname: "LunarFox", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=LunarFox&backgroundColor=1a1f2e", lastMsg: "Давай дуо попробуем?", online: true },
  { id: "4", nickname: "IronWolf", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=IronWolf&backgroundColor=1a1f2e", lastMsg: "Готов на турнир?", online: false },
];

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "me", text: input, time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      {/* Contacts */}
      <div className="w-72 border-r border-border bg-sidebar">
        <div className="p-4">
          <h2 className="text-sm font-bold text-foreground">Чаты</h2>
        </div>
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedContact(c)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              selectedContact.id === c.id ? "bg-primary/10" : "hover:bg-secondary"
            }`}
          >
            <div className="relative">
              <img src={c.avatar} alt={c.nickname} className="h-10 w-10 rounded-full" />
              {c.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-like outline-2 outline-sidebar" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{c.nickname}</p>
              <p className="truncate text-xs text-muted-foreground">{c.lastMsg}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <img src={selectedContact.avatar} alt="" className="h-9 w-9 rounded-full" />
          <div>
            <p className="text-sm font-bold text-foreground">{selectedContact.nickname}</p>
            <p className="text-xs text-muted-foreground">{selectedContact.online ? "Онлайн" : "Был недавно"}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.text}
                  <span className={`mt-1 block text-[10px] ${msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Написать сообщение..."
              className="flex-1 rounded-xl bg-input px-4 py-3 text-sm text-foreground shadow-card outline-none transition-shadow focus:shadow-input-focus"
            />
            <Button variant="default" size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
