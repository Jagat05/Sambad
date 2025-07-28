"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Search, Plus, Hash, Lock, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatMember {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  type?: "channel" | "group" | "dm";
  isPrivate?: boolean;
  members: ChatMember[];
}

interface Member {
  id: string;
  username: string;
  avatar?: string;
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
  members,
}: ChatSidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const { token, id: userId } = useSelector((state: any) => state.user);
  const { onlineUsers } = useSelector((state: any) => state.online);

  // useEffect(() => {
  //   if (organizationId) fetchChats();
  // }, [organizationId]);

  useEffect(() => {
    if (organizationId) fetchChats();

    const handleAvatarUpdate = () => fetchChats();
    window.addEventListener("avatar-updated", handleAvatarUpdate);

    return () => {
      window.removeEventListener("avatar-updated", handleAvatarUpdate);
    };
  }, [organizationId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Chat[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${organizationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Group name required");
    setCreatingGroup(true);
    try {
      const { data } = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/create-group`,
        { organizationId, chatName: newGroupName.trim(), members: [userId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats((prev) => [data, ...prev]);
      setNewGroupName("");
      setIsCreatingGroup(false);
      onSelectChat(data);
      toast.success("Group created.");
    } catch {
      toast.error("Failed to create group.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return toast.error("Channel name required");
    setCreatingChannel(true);
    try {
      const { data } = await axios.post<Chat>(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/create-channel`,
        { organizationId, chatName: newChannelName.trim(), members: [userId] },
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

      {/* Create Buttons */}
      <div className="p-4 border-b flex flex-col gap-2">
        <Button
          onClick={() => setIsCreatingChannel(true)}
          className="w-full bg-blue-600 text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" /> New Channel
        </Button>
        <Button
          onClick={() => setIsCreatingGroup(true)}
          className="w-full bg-indigo-600 text-white"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" /> New Group
        </Button>
      </div>

      {/* Modals */}
      {(isCreatingChannel || isCreatingGroup) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
            <X
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => {
                setIsCreatingChannel(false);
                setIsCreatingGroup(false);
              }}
            />
            <h2 className="text-lg font-semibold mb-4">
              {isCreatingChannel ? "Create Channel" : "Create Group"}
            </h2>
            <Input
              placeholder={`Enter ${
                isCreatingChannel ? "channel" : "group"
              } name`}
              value={isCreatingChannel ? newChannelName : newGroupName}
              onChange={(e) =>
                isCreatingChannel
                  ? setNewChannelName(e.target.value)
                  : setNewGroupName(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (isCreatingChannel
                  ? handleCreateChannel()
                  : handleCreateGroup())
              }
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingChannel(false);
                  setIsCreatingGroup(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  isCreatingChannel ? handleCreateChannel : handleCreateGroup
                }
                disabled={isCreatingChannel ? creatingChannel : creatingGroup}
              >
                {(isCreatingChannel ? creatingChannel : creatingGroup)
                  ? "Creating..."
                  : "Create"}
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
            const isSelected = selectedChat === chat._id;

            return (
              <div
                key={chat._id}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {chat.isGroupChat || chat.type === "channel" ? (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {chat.type === "channel" ? (
                          <Hash className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </div>
                    ) : other?.avatar ? (
                      <img
                        src={other.avatar}
                        alt={other.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold uppercase">
                        {other?.username?.[0] ?? "?"}
                      </div>
                    )}
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

        {/* Members */}
        <div className="mt-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Members
        </div>
        {members.map((member) => {
          const isOnline = onlineUsers.includes(member.id);
          return (
            <div
              key={member.id}
              className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelectMember(member.id)}
            >
              <div className="relative">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center uppercase font-medium">
                    {member.username[0]}
                  </div>
                )}
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
