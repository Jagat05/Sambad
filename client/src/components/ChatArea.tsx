"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Hash,
  Lock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import socket from "@/utils/socket";

interface Message {
  _id: string;
  content: string;
  sender?: { _id: string; email: string }; // Made optional for safety
  createdAt: string;
}

interface ChatInfo {
  _id: string;
  chatName?: string;
  type?: "channel" | "group" | "dm";
  members?: { _id: string; email: string }[];
  isPrivate?: boolean;
}

interface ChatAreaProps {
  chatId: string | null;
  organizationId: string;
}

export const ChatArea = ({ chatId }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token, id: userId } = useSelector((s: any) => s.user);

  // Fetch messages & info
  useEffect(() => {
    if (!chatId) return;

    const fetch = async () => {
      try {
        const [msgs, info] = await Promise.all([
          axios.get<Message[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/messages/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<ChatInfo>(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setMessages(msgs.data);
        setChatInfo(info.data);
      } catch (err) {
        toast.error("Failed to load chat.");
        setMessages([]);
        setChatInfo(null);
      }
    };

    fetch();
    socket.emit("joinChat", chatId);

    const handleNew = (newMsg: Message) => {
      setMessages((prev) =>
        prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]
      );
    };

    socket.on("newMessage", handleNew);

    return () => {
      socket.off("newMessage", handleNew);
    };
  }, [chatId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;

    const temp: Message = {
      _id: `temp-${Date.now()}`,
      content: message.trim(),
      sender: { _id: userId, email: "You" },
      createdAt: new Date().toISOString(),
    };

    setMessages((p) => [...p, temp]);
    socket.emit("sendMessage", { chatId, message: temp });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { chatId, content: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("");
    } catch {
      toast.error("Failed to send");
      setMessages((p) => p.filter((m) => m._id !== temp._id));
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getIcon = () => {
    if (!chatInfo) return null;
    if (chatInfo.type === "channel") {
      return chatInfo.isPrivate ? (
        <Lock className="w-5 h-5" />
      ) : (
        <Hash className="w-5 h-5" />
      );
    }
    if (chatInfo.type === "group") return <Users className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {getIcon() || (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {chatInfo?.chatName?.[0]?.toUpperCase() || "C"}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center">
              {chatInfo?.chatName || "Chat"}
              {chatInfo?.isPrivate && (
                <Lock className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </h2>
            <p className="text-sm text-gray-600">
              {chatInfo?.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {chatInfo?.type === "dm" && (
            <>
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg?.sender?._id === userId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isMe
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-white text-gray-800 shadow-sm border border-gray-200"
                }`}
              >
                {!isMe && msg?.sender?.email && (
                  <p className="text-xs text-gray-500 mb-1 font-semibold">
                    {msg.sender.email}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMe ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message ${chatInfo?.chatName || "..."}`}
              className="pr-12 bg-gray-100 border-gray-300 focus:bg-white rounded-full"
              disabled={!chatId}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-10 h-10 p-0"
            disabled={!message.trim() || !chatId}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
