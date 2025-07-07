"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Search, Plus, Hash, Lock, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Member {
  id: string;
  username: string;
}

export interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  type?: "channel" | "group" | "dm";
  isPrivate?: boolean;
  members: { _id: string; email: string; username: string }[];
}

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chat: Chat) => void;
  organizationId: string;
  members: Member[];
}

export const ChatSidebar = ({
  selectedChat,
  onSelectChat,
  organizationId,
  members = [],
}: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);

  const { token, id: userId } = useSelector((state: any) => state.user);
  const { onlineUsers } = useSelector((state: any) => state.online);

  useEffect(() => {
    if (organizationId) fetchChats();
  }, [organizationId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Chat[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${organizationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChats(data);
    } catch {
      toast.error("Failed to load chats.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = async (memberId: string) => {
    try {
      const { data } = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        { userId: memberId, organizationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSelectChat(data);
      fetchChats();
    } catch {
      toast.error("Failed to open direct message.");
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      return toast.error("Channel name required");
    }
    setCreatingChannel(true);
    try {
      const { data } = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/create-channel`,
        {
          organizationId,
          chatName: newChannelName.trim(),
          isGroupChat: true,
          isPrivate: false,
          members: [userId],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats((prev) => [data, ...prev]);
      setNewChannelName("");
      setIsCreatingChannel(false);
      onSelectChat(data);
      toast.success("Channel created.");
    } catch {
      toast.error("Failed to create channel.");
    } finally {
      setCreatingChannel(false);
    }
  };

  const getChatName = (chat: Chat): string => {
    if (chat.isGroupChat || chat.type === "channel") return chat.chatName ?? "";
    const other = chat.members.find((m) => m._id !== userId);
    return other?.username || "Direct Message";
  };

  const isUserOnline = (id: string) => onlineUsers.includes(id);

  const filteredChats = chats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
            disabled={loading}
          />
        </div>
      </div>

      {/* New Channel Button */}
      <div className="p-4 border-b">
        <Button
          onClick={() => setIsCreatingChannel(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" /> New Channel
        </Button>
      </div>

      {/* Create Channel Modal */}
      {isCreatingChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-80 relative">
            <X
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setIsCreatingChannel(false)}
              aria-label="Close modal"
            />
            <h2 className="text-lg font-semibold mb-4">Create Channel</h2>
            <Input
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreatingChannel(false)}
                disabled={creatingChannel}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateChannel} disabled={creatingChannel}>
                {creatingChannel ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Loading chats…</p>
        ) : filteredChats.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No chats found.</p>
        ) : (
          filteredChats.map((chat) => {
            const other = chat.members.find((m) => m._id !== userId);
            const isOnline = other ? isUserOnline(other._id) : false;

            const chatName = getChatName(chat);
            const initials = chatName[0]?.toUpperCase() || "?";

            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  selectedChat === chat._id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelectChat(chat);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold uppercase">
                      {chat.isGroupChat || chat.type === "channel" ? (
                        chat.type === "channel" ? (
                          <Hash className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )
                      ) : (
                        initials
                      )}
                    </div>
                    {chat.type === "dm" && (
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{chatName}</p>
                </div>
              </div>
            );
          })
        )}

        {/* Members List */}
        <div className="mt-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Members
        </div>
        {members.map((member) => {
          const isOnline = onlineUsers.includes(member.id);
          return (
            <div
              key={member.id}
              onClick={() => handleSelectMember(member.id)}
              className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelectMember(member.id);
              }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center uppercase font-medium">
                  {member.username[0]}
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <p className="text-sm text-gray-800">{member.username}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
