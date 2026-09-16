"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessageStream,
  type Conversation,
  type Message,
} from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Plus,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Cpu,
  Zap,
  MessageSquare,
  Loader2,
  Trash2,
} from "lucide-react";

const suggestions = [
  { icon: BookOpen, text: "Explain how a CMOS inverter works" },
  { icon: Lightbulb, text: "What is setup time violation?" },
  { icon: HelpCircle, text: "Walk me through the ASIC flow" },
  { icon: Cpu, text: "What is clock tree synthesis?" },
  { icon: Zap, text: "How does power gating work?" },
  { icon: BookOpen, text: "Explain static timing analysis" },
];

export default function TutorPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  async function loadConversations() {
    setLoadingConvs(true);
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch {
      // ignore
    }
    setLoadingConvs(false);
  }

  async function loadMessages(convId: string) {
    setLoadingMessages(true);
    try {
      const msgs = await getMessages(convId);
      setMessages(msgs);
    } catch {
      // ignore
    }
    setLoadingMessages(false);
  }

  async function handleNewChat() {
    setActiveConvId(null);
    setMessages([]);
    setStreamingText("");
  }

  async function handleSend(text?: string) {
    const content = text || input.trim();
    if (!content || isStreaming) return;

    setInput("");

    let convId = activeConvId;

    if (!convId) {
      try {
        const conv = await createConversation();
        convId = conv.id;
        setActiveConvId(convId);
        setConversations((prev) => [conv, ...prev]);
      } catch {
        return;
      }
    }

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsStreaming(true);
    setStreamingText("");

    await sendMessageStream(
      convId,
      content,
      undefined,
      (chunk) => {
        setStreamingText((prev) => prev + chunk);
      },
      () => {
        setStreamingText((prev) => {
          if (prev) {
            const assistantMsg: Message = {
              id: `temp-ai-${Date.now()}`,
              role: "assistant",
              content: prev,
              created_at: new Date().toISOString(),
            };
            setMessages((m) => [...m, assistantMsg]);
          }
          return "";
        });
        setIsStreaming(false);
        loadConversations();
      },
      (error) => {
        setStreamingText("");
        setIsStreaming(false);
        const errorMsg: Message = {
          id: `temp-err-${Date.now()}`,
          role: "assistant",
          content: `Error: ${error}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
  }

  const hasMessages = messages.length > 0 || streamingText;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Conversation sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-3 border-b border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No conversations yet
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                    activeConvId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {conv.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with new chat */}
        <div className="lg:hidden flex items-center gap-2 p-3 border-b border-border">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">AI VLSI Tutor</h1>
              <p className="text-muted-foreground max-w-md mb-8">
                Ask anything about VLSI design, digital logic, physical design,
                or semiconductor engineering.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl w-full">
                {suggestions.map((s) => (
                  <Card
                    key={s.text}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleSend(s.text)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <s.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs">{s.text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-muted">
                    <div className="whitespace-pre-wrap break-words">
                      {streamingText}
                      <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  user
                    ? "Ask the tutor a question..."
                    : "Sign in to start chatting..."
                }
                disabled={!user || isStreaming}
                className="flex-1 min-h-[44px] max-h-32 resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                rows={1}
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!user || !input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses are generated. Always verify technical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
