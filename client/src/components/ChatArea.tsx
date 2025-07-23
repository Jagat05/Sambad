"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Send,
  Paperclip,
  Smile,
  Lock,
  Hash,
  Users,
  MoreHorizontal,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
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
  admin?: string;
}

interface ChatAreaProps {
  chatId: string | null;
}

export const ChatArea = ({ chatId }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { _id: string; username: string; email: string }[]
  >([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token, id: userId } = useSelector((state: any) => state.user);
  const router = useRouter();

  useSocket(token);
  const socket = getSocket();

  // Fetch chat info (to refresh on add/remove)
  const fetchChatInfo = async (id: string) => {
    try {
      const res = await axios.get<Chat>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChat(res.data);
    } catch {
      toast.error("Failed to fetch updated chat info.");
    }
  };

  // Initial fetch: messages + chat info + socket listeners
  useEffect(() => {
    if (!chatId) return;

    const fetchData = async () => {
      try {
        const [msgRes, chatRes] = await Promise.all([
          axios.get<Message[]>(
            `${process.env.NEXT_PUBLIC_API_URL}/messages/${chatId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get<Chat>(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-info/${chatId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);
        setMessages(msgRes.data);
        setChat(chatRes.data);
      } catch {
        toast.error("Failed to load chat data.");
      }
    };

    fetchData();

    if (!socket) return;

    socket.emit("joinChat", chatId);

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) =>
        prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };

    const handleMemberRemoved = (data: {
      chatId: string;
      removedUserId: string;
      updatedChat: Chat;
    }) => {
      if (data.chatId !== chatId) return;
      fetchChatInfo(chatId); // Refresh chat
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

  // Scroll bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !chatId) return;
    const content = message.trim();
    setMessage("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { chatId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format message time
  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Get chat icon
  const getIcon = () => {
    if (!chat) return null;
    if (chat.type === "channel") return chat.isPrivate ? <Lock /> : <Hash />;
    if (chat.type === "group") return <Users />;
    return null;
  };

  // Get chat display name
  const getChatName = () => {
    if (!chat) return "";
    if (chat.isGroupChat || chat.type === "channel")
      return chat.chatName || "Chat";
    const other = chat.members.find((m) => m._id !== userId);
    return other?.username || "Direct Message";
  };

  const currentUserRole =
    chat?.members.find((m) => m._id === userId)?.role || "member";

  // Search users for adding member
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/search?query=${searchQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(
          res.data.filter(
            (u: any) => !chat?.members.some((m) => m._id === u._id)
          )
        );
      } catch {
        toast.error("Search failed.");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, chat?.members, token]);

  // Add member handler
  const addMember = async (userIdToAdd: string) => {
    if (!userIdToAdd || !chat?._id) return;

    setAddingId(userIdToAdd);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/add-member`,
        {
          chatId: chat._id,
          userIdToAdd,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Member added successfully");

      // Update chat info
      await fetchChatInfo(chat._id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to add member");
    } finally {
      setAddingId(null);
    }
  };

  // Remove member handler
  const removeMember = async (id: string) => {
    if (currentUserRole !== "admin")
      return toast.error("Only admins can remove members.");
    if (!confirm("Remove this member?")) return;

    setRemovingIds((ids) => [...ids, id]);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/remove-member`,
        { chatId: chat?._id, userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Member removed.");
      await fetchChatInfo(chatId!); // Refresh chat
      socket?.emit("memberRemoved", {
        chatId: chat?._id,
        removedUserId: id,
        updatedChat: res.data,
      });
    } catch {
      toast.error("Remove failed.");
    } finally {
      setRemovingIds((ids) => ids.filter((removeId) => removeId !== id));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        {/* Left: icon + chat name + members count + search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {getIcon() || (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold select-none">
              {chat ? getChatName()[0] : "C"}
            </div>
          )}

          <div className="min-w-[150px] truncate">
            <h2 className="font-semibold truncate">
              {chat ? getChatName() : "Chat"}
            </h2>
            <p className="text-sm text-gray-600">
              {chat?.members.length ?? 0} members
            </p>
          </div>

          {/* Search bar (admin only) */}
          {chat?.isGroupChat && currentUserRole === "admin" && (
            <div className="relative flex-1 min-w-0 ml-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="w-full"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              />
              {searchFocused && searchQuery.trim() && (
                <ul className="absolute z-50 top-full left-0 right-0 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded shadow-md mt-1">
                  {searchResults.length === 0 ? (
                    <li className="p-2 text-sm text-gray-500">
                      No users found
                    </li>
                  ) : (
                    searchResults.map((user) => (
                      <li
                        key={user._id}
                        className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="truncate">
                          <p className="font-semibold truncate">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          disabled={addingId === user._id}
                          onClick={() => addMember(user._id)}
                        >
                          {addingId === user._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right side menu */}
        <div className="flex items-center gap-2">
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg focus:outline-none z-50">
                {chat?.isGroupChat && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          active ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          alert(
                            "Members: " +
                              chat.members.map((m) => m.username).join(", ")
                          );
                        }}
                      >
                        View Members
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                        active ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this chat?")
                        ) {
                          toast("Chat deleted (demo only).");
                          router.push("/chats");
                        }
                      }}
                    >
                      Delete Chat
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
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

      {/* Group Members */}
      {chat?.isGroupChat && (
        <div className="p-4 border-t bg-gray-50 max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Members</h3>
          <ul>
            {chat.members.map((member) => {
              const isMe = member._id === userId;
              const canRemove = currentUserRole === "admin" && !isMe;
              return (
                <li
                  key={member._id}
                  className="flex justify-between items-center py-1"
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
                      disabled={removingIds.includes(member._id)}
                      onClick={() => removeMember(member._id)}
                      className={`text-sm font-semibold ${
                        removingIds.includes(member._id)
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-500 hover:text-red-700 cursor-pointer"
                      }`}
                    >
                      {removingIds.includes(member._id)
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

      {/* Input Box */}
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
              placeholder={`Message ${chat ? getChatName() : "..."}`}
              className="pr-12 bg-gray-100 border-gray-300 focus:bg-white rounded-full"
              disabled={!chatId}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              disabled={!chatId}
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

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
