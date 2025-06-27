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

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    email: string;
  };
  createdAt: string;
}

interface ChatInfo {
  _id: string;
  name?: string;
  type?: "channel" | "group" | "dm";
  members?: { _id: string; email: string }[];
  isPrivate?: boolean;
}

interface ChatAreaProps {
  chatId: string | null;
  organizationId: string;
}

export const ChatArea = ({ chatId, organizationId }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { token, id: userId } = useSelector((state: any) => state.user);

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data);
    } catch {
      toast.error("Failed to fetch messages.");
    }
  };

  const fetchChatInfo = async () => {
    if (!chatId) return;
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const name = res.data.isGroupChat
        ? res.data.chatName
        : res.data.members.find((m: any) => m._id !== userId)?.email ||
          "Direct Message";

      setChatInfo({
        _id: res.data._id,
        name,
        type: res.data.type || (res.data.isGroupChat ? "group" : "dm"),
        isPrivate: res.data.isPrivate,
        members: res.data.members,
      });
    } catch {
      toast.error("Failed to fetch chat info.");
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchChatInfo();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { chatId, content: message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatIcon = () => {
    if (chatInfo?.type === "channel") {
      return chatInfo.isPrivate ? (
        <Lock className="w-5 h-5" />
      ) : (
        <Hash className="w-5 h-5" />
      );
    }
    if (chatInfo?.type === "group") return <Users className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getChatIcon() || (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {chatInfo?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center">
                {chatInfo?.name || "Chat"}
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender._id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender._id === userId
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-200"
              }`}
            >
              {msg.sender._id !== userId && (
                <p className="text-xs text-gray-500 mb-1 font-semibold">
                  {msg.sender.email}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender._id === userId ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder={`Message ${chatInfo?.name || "..."}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-12 bg-gray-100 border-gray-300 focus:bg-white rounded-full"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
