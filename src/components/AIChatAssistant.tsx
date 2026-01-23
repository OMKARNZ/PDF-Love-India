import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2, Copy, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatAssistantProps {
  documentText?: string;
  apiKey: string;
  onAddToPDF?: (text: string) => void;
}

const AIChatAssistant = ({ documentText, apiKey, onAddToPDF }: AIChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) {
      if (!apiKey) {
        toast({
          title: "API key required",
          description: "Please configure your Gemini API key in settings.",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let systemContext = "You are a helpful AI assistant specialized in document analysis and content creation. Be concise and helpful.";
      
      if (documentText) {
        systemContext += `\n\nThe user has a document open with the following content:\n\n${documentText.substring(0, 10000)}\n\nUse this context to answer questions about the document or generate relevant content.`;
      }

      const prompt = `${systemContext}\n\nUser: ${userMessage}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickActions = [
    "Summarize this document",
    "Find key points",
    "Suggest improvements",
    "Write a disclaimer",
  ];

  return (
    <>
      {/* Floating orb button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50 flex items-center justify-center
          rounded-full shadow-card-hover transition-all
          ${isOpen ? "h-12 w-12 bg-secondary" : "h-14 w-14 bg-primary animate-glow"}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-3xl bg-card shadow-card-hover overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {documentText ? "Document loaded" : "Ask me anything"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin min-h-[300px]">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-6">
                    {documentText
                      ? "Ask questions about your document"
                      : "Start a conversation"}
                  </p>
                  
                  {/* Quick actions */}
                  {documentText && (
                    <div className="space-y-2">
                      {quickActions.map((action) => (
                        <button
                          key={action}
                          onClick={() => {
                            setInput(action);
                            inputRef.current?.focus();
                          }}
                          className="block w-full text-left px-3 py-2 rounded-xl bg-secondary/50 text-sm hover:bg-secondary transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[85%] rounded-2xl px-4 py-2.5 text-sm
                        ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                        }
                      `}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20">
                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy
                          </button>
                          
                          {onAddToPDF && (
                            <button
                              onClick={() => onAddToPDF(msg.content)}
                              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Add to PDF
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="rounded-full h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;
