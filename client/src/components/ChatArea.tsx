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
import { useRouter } from "next/navigation";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; email: string };
  createdAt: string;
}

export interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  type?: "channel" | "group" | "dm";
  isPrivate?: boolean;
  members: {
    _id: string;
    email: string;
    username: string;
    role: "admin" | "member";
  }[];
}

interface ChatAreaProps {
  chatId: string | null;
}

export const ChatArea = ({ chatId }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [Chat, setChat] = useState<Chat | null>(null);
  const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token, id: userId } = useSelector((state: any) => state.user);
  const router = useRouter();

  useSocket(token);
  const socket = getSocket();

  useEffect(() => {
    if (!chatId) return;

    const fetchChatData = async () => {
      try {
        const [msgRes, infoRes] = await Promise.all([
          axios.get<Message[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/messages/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<Chat>(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${chatId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setMessages(msgRes.data);
        setChat(infoRes.data);
      } catch {
        toast.error("Failed to load chat.");
      }
    };

    fetchChatData();

    if (!socket) return;

    if (socket.connected) {
      socket.emit("joinChat", chatId);
    } else {
      socket.once("connect", () => {
        socket.emit("joinChat", chatId);
      });
    }

    const handleNewMessage = (newMsg: Message) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === newMsg._id);
        return exists ? prev : [...prev, newMsg];
      });
    };

    const handleMemberRemoved = (data: {
      chatId: string;
      removedUserId: string;
      updatedChat: Chat;
    }) => {
      if (data.chatId !== chatId) return;
      setChat(data.updatedChat);
      if (data.removedUserId === userId) {
        alert("You have been removed from this group.");
        router.push("/chats");
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("memberRemoved", handleMemberRemoved);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("memberRemoved", handleMemberRemoved);
    };
  }, [chatId, token, socket, userId, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    const msgContent = message.trim();
    setMessage("");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { chatId, content: msgContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to send.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getIcon = () => {
    if (!Chat) return null;
    if (Chat.type === "channel") return Chat.isPrivate ? <Lock /> : <Hash />;
    if (Chat.type === "group") return <Users />;
    return null;
  };

  const getChatName = (chat: Chat) => {
    if (chat.isGroupChat || chat.type === "channel") return chat.chatName!;
    const other = chat.members.find((m) => m._id !== userId);
    return other?.username || "Direct Message";
  };

  const currentUserRole =
    Chat?.members.find((m) => m._id === userId)?.role || "member";

  const removeMember = async (memberId: string) => {
    if (!Chat || currentUserRole !== "admin") return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    setRemovingMemberIds((ids) => [...ids, memberId]);

    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/remove-member`,
        { chatId: Chat._id, userId: memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChat(res.data);
      toast.success("Member removed successfully");

      socket?.emit("memberRemoved", {
        chatId: Chat._id,
        removedUserId: memberId,
        updatedChat: res.data,
      });
    } catch {
      toast.error("Failed to remove member.");
    } finally {
      setRemovingMemberIds((ids) => ids.filter((id) => id !== memberId));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {getIcon() || (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
              {Chat ? getChatName(Chat)[0] : "C"}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center">
              {Chat ? getChatName(Chat) : "Chat"}
              {Chat?.isPrivate && (
                <Lock className="w-4 h-4 ml-2 text-gray-400" />
              )}
            </h2>
            <p className="text-sm text-gray-600">
              {Chat?.members?.length || 0} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Chat?.type === "dm" && (
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
          const isMe = msg.sender?._id === userId;
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

      {/* Group Members + Add Member Button */}
      {Chat?.isGroupChat && (
        <div className="p-4 border-t bg-gray-50 max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Members</h3>
            {currentUserRole === "admin" && (
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => router.push(`/chats/${chatId}/add-members`)}
              >
                + Add Member
              </Button>
            )}
          </div>
          <ul>
            {Chat.members.map((member) => {
              const isCurrentUser = member._id === userId;
              const canRemove = currentUserRole === "admin" && !isCurrentUser;
              return (
                <li
                  key={member._id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center space-x-2">
                    <span>{member.username || member.email}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        member.role === "admin"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  {canRemove && (
                    <button
                      onClick={() => removeMember(member._id)}
                      disabled={removingMemberIds.includes(member._id)}
                      className={`text-sm font-semibold ${
                        removingMemberIds.includes(member._id)
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700 cursor-pointer"
                      }`}
                    >
                      {removingMemberIds.includes(member._id)
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
              placeholder={`Message ${Chat ? getChatName(Chat) : "..."}`}
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
