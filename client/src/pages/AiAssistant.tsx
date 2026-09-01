import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function AiAssistant() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // TODO: Implement AI chat API call
      // const response = await api.chat({ message: userMessage, history: messages });
      
      // Mock response for now
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "AI Assistant is not fully configured yet. Connect your GEMINI_API_KEY in the server .env file to enable this feature.",
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">
                Ask me anything about coding, debugging, or development
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-primary" />
              <h2 className="mb-2 text-xl font-semibold">How can I help you today?</h2>
              <p className="text-muted-foreground">
                Ask me to explain code, debug issues, generate components, or help with
                hackathons
              </p>
            </div>
          ) : (
            messages.map((message, i) => (
              <Card
                key={i}
                className={`p-4 ${
                  message.role === "user"
                    ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                    : "mr-auto max-w-[80%]"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </Card>
            ))
          )}
          {loading && (
            <Card className="mr-auto max-w-[80%] p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="min-h-[60px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
