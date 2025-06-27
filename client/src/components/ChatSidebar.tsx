"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Search, Plus, Hash, Lock, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chat: any) => void;
  organizationId: string;
  members: { id: string; username: string; online: boolean }[];
}

export const ChatSidebar = ({
  selectedChat,
  onSelectChat,
  organizationId,
  members = [],
}: ChatSidebarProps) => {
  const [chats, setChats] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const { token, id: userId } = useSelector((state: any) => state.user);

  useEffect(() => {
    if (organizationId) fetchChats();
  }, [organizationId]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${organizationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChats(res.data);
    } catch (error) {
      toast.error("Failed to load chats.");
    }
  };

  const handleSelectMember = async (memberId: string) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        { userId: memberId, organizationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSelectChat(res.data);
      fetchChats();
    } catch {
      toast.error("Failed to open direct message.");
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error("Channel name cannot be empty.");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/create-channel`,
        {
          organizationId,
          chatName: newChannelName.trim(),
          isGroupChat: true,
          isPrivate: false,
          members: [userId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChats((prev) => [res.data, ...prev]);
      setNewChannelName("");
      setIsCreatingChannel(false);
      onSelectChat(res.data);
      toast.success("Channel created successfully.");
    } catch {
      toast.error("Failed to create channel.");
    }
  };

  const getIconForChat = (chat: any) => {
    if (chat.isGroupChat) return <Users className="w-4 h-4" />;
    if (chat.type === "channel") {
      return chat.isPrivate ? (
        <Lock className="w-4 h-4" />
      ) : (
        <Hash className="w-4 h-4" />
      );
    }
    return <Hash className="w-4 h-4" />;
  };

  const getChatDisplayName = (chat: any) => {
    if (chat.isGroupChat || chat.type === "channel") return chat.chatName;
    const otherUser = chat.members.find((m: any) => m._id !== userId);
    return otherUser?.email || "Direct Message";
  };

  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* New Channel Button */}
      <div className="p-4 border-b border-gray-200">
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          onClick={() => setIsCreatingChannel(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Channel
        </Button>
      </div>

      {/* Create Channel Modal */}
      {isCreatingChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg relative">
            <button
              onClick={() => setIsCreatingChannel(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>
            <Input
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateChannel();
                }
              }}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatingChannel(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateChannel}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`p-3 cursor-pointer hover:bg-gray-100 ${
              selectedChat === chat._id
                ? "bg-blue-50 border-l-4 border-blue-600"
                : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600">
                {getIconForChat(chat)}
              </div>
              <p className="text-sm font-medium text-gray-800">
                {getChatDisplayName(chat)}
              </p>
            </div>
          </div>
        ))}

        {/* Member List */}
        <div className="mt-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Members
        </div>
        {members.map((member) => (
          <div
            key={member.id}
            className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelectMember(member.id)}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center">
                {member.username[0].toUpperCase()}
              </div>
              {member.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <p className="text-sm text-gray-800">{member.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
