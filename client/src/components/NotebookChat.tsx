import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface NotebookChatProps {
  notebookId: string;
}

export function NotebookChat({ notebookId }: NotebookChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", notebookId],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${notebookId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!notebookId,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notebookId, message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ["/api/chat", notebookId] });
      const previous = queryClient.getQueryData(["/api/chat", notebookId]);
      queryClient.setQueryData(["/api/chat", notebookId], (old: ChatMessage[] = []) => [
        ...old,
        { id: "temp-user", role: "user", content: message, createdAt: new Date().toISOString() },
        { id: "temp-ai", role: "assistant", content: "...", createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/chat", notebookId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", notebookId] });
    },
  });

  const clearChat = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chat/${notebookId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear chat");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", notebookId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;
    sendMessage.mutate(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearChat.mutate()}
            disabled={clearChat.isPending}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-3 rounded-full bg-accent/10 w-fit mx-auto mb-3">
              <Bot className="w-6 h-6 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm">
              Ask questions about your sources
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              I'll answer based on your uploaded documents
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content === "..." ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="p-2 rounded-full bg-primary/10 h-fit shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your sources..."
            className="flex-1 px-4 py-2.5 bg-muted border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
            disabled={sendMessage.isPending}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || sendMessage.isPending}
            className="rounded-xl"
            data-testid="button-send-message"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
