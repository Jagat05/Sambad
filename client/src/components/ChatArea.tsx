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
import { useSocket } from "@/hooks/useSocket";
import { getSocket } from "@/utils/socket";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; email: string };
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
}

export const ChatArea = ({ chatId }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token, id: userId } = useSelector((s: any) => s.user);

  // Initialize socket connection and get instance
  useSocket(token);
  const socket = getSocket();

  useEffect(() => {
    if (!chatId) return;

    // Fetch chat info and messages from backend
    const fetchChatData = async () => {
      try {
        const [msgRes, infoRes] = await Promise.all([
          axios.get<Message[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/messages/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<ChatInfo>(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setMessages(msgRes.data);
        setChatInfo(infoRes.data);
      } catch {
        toast.error("Failed to load chat.");
      }
    };

    fetchChatData();

    if (!socket) return;

    // Join chat room on socket
    if (socket.connected) {
      socket.emit("joinChat", chatId);
    } else {
      socket.once("connect", () => {
        socket.emit("joinChat", chatId);
      });
    }

    // Handler for receiving new messages
    const handleNewMessage = (newMsg: Message) => {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m._id));
        if (ids.has(newMsg._id)) return prev;

        // Replace temporary message if matched by content and sender
        const tempIndex = prev.findIndex(
          (m) =>
            m._id.startsWith("temp-") &&
            m.content === newMsg.content &&
            m.sender?._id === newMsg.sender?._id
        );
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = newMsg;
          return updated;
        }
        return [...prev, newMsg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatId, token, socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      _id: tempId,
      content: message.trim(),
      sender: { _id: userId, email: "You" },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { chatId, content: tempMsg.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const saved = res.data as Message;

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? saved : msg))
      );
      // backend emits "newMessage" event to all clients including this one
    } catch {
      toast.error("Failed to send.");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getIcon = () => {
    if (!chatInfo) return null;
    if (chatInfo.type === "channel")
      return chatInfo.isPrivate ? <Lock /> : <Hash />;
    if (chatInfo.type === "group") return <Users />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {getIcon() || (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
              {chatInfo?.chatName?.[0] || "C"}
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
        <div className="flex items-center gap-2">
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
          const isMe = msg.sender?._id?.toString() === userId?.toString();
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isMe
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-white text-gray-800 shadow-sm border"
                }`}
              >
                {!isMe && (
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
          <Button variant="ghost" size="sm" disabled={!chatId}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
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
