import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Mock data - replace with real API calls
  const conversations: any[] = [];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Conversations List */}
      <div className="w-full border-r border-border sm:w-80">
        <div className="border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={MessageSquare}
                title="No messages"
                description="Start a conversation with other developers"
              />
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`flex w-full items-start gap-3 border-b border-border p-4 transition-colors hover:bg-muted/50 ${
                  selectedConversation === conversation.id ? "bg-muted" : ""
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="truncate font-semibold">{conversation.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Username</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <EmptyState
                icon={MessageSquare}
                title="No messages yet"
                description="Start the conversation"
              />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No conversation selected"
              description="Select a conversation from the list"
            />
          </div>
        )}
      </div>
    </div>
  );
}
