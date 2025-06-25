"use client";

import { useState } from "react";
import { Search, Plus, MessageCircle, Hash, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  online: boolean;
  type: "channel" | "dm" | "group";
  isPrivate?: boolean;
}

interface Member {
  id: string;
  username: string;
  online: boolean;
}

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  organizationId: string;
  members: Member[];
}

export const ChatSidebar = ({
  selectedChat,
  onSelectChat,
  organizationId,
  members = [],
}: ChatSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getChatsForOrganization = (orgId: string): Chat[] => {
    const chatData: Record<string, Chat[]> = {
      "1": [
        {
          id: "1",
          name: "general",
          lastMessage: "Welcome everyone to the team!",
          timestamp: "2 min ago",
          unread: 3,
          type: "channel",
          online: false,
        },
        {
          id: "2",
          name: "development",
          lastMessage: "The new feature is ready for testing",
          timestamp: "15 min ago",
          unread: 0,
          type: "channel",
          online: false,
        },
        {
          id: "3",
          name: "design-team",
          lastMessage: "Updated the mockups",
          timestamp: "1 hour ago",
          unread: 1,
          type: "channel",
          isPrivate: true,
          online: false,
        },
        {
          id: "4",
          name: "Sarah Johnson",
          lastMessage: "Can we discuss the project timeline?",
          timestamp: "3 hours ago",
          unread: 0,
          avatar: "S",
          online: true,
          type: "dm",
        },
        {
          id: "5",
          name: "Project Alpha Team",
          lastMessage: "Meeting at 3 PM today",
          timestamp: "Yesterday",
          unread: 0,
          avatar: "P",
          online: false,
          type: "group",
        },
      ],
      "2": [
        {
          id: "6",
          name: "creative",
          lastMessage: "Love the new brand guidelines!",
          timestamp: "5 min ago",
          unread: 2,
          type: "channel",
          online: false,
        },
        {
          id: "7",
          name: "client-feedback",
          lastMessage: "Client approved the final design",
          timestamp: "30 min ago",
          unread: 0,
          type: "channel",
          online: false,
        },
      ],
      "3": [
        {
          id: "8",
          name: "campaigns",
          lastMessage: "Q4 campaign performance looks great",
          timestamp: "1 hour ago",
          unread: 1,
          type: "channel",
          online: false,
        },
      ],
    };
    return chatData[String(orgId)] || [];
  };

  const chats = getChatsForOrganization(organizationId);
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const channels = filteredChats.filter((chat) => chat.type === "channel");
  const directMessages = filteredChats.filter((chat) => chat.type === "dm");
  const groups = filteredChats.filter((chat) => chat.type === "group");

  const getIconForChat = (chat: Chat) => {
    if (chat.type === "channel") {
      return chat.isPrivate ? (
        <Lock className="w-4 h-4" />
      ) : (
        <Hash className="w-4 h-4" />
      );
    }
    if (chat.type === "group") return <Users className="w-4 h-4" />;
    return null;
  };

  const renderChatItem = (chat: Chat) => (
    <div
      key={`chat-${chat.id}`}
      onClick={() => onSelectChat(chat.id)}
      className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
        selectedChat === chat.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          {chat.type === "dm" ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {chat.avatar || chat.name[0].toUpperCase()}
              </div>
              {chat.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </>
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600">
              {getIconForChat(chat)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-gray-900 truncate text-sm flex items-center">
              {chat.name}
              {chat.isPrivate && (
                <Lock className="w-3 h-3 ml-1 text-gray-400" />
              )}
            </h3>
            <span className="text-xs text-gray-500">{chat.timestamp}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
            {chat.unread > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMember = (member: Member) => (
    <div
      key={`member-${member.id}-${member.username}`}
      className="p-3 cursor-default flex items-center space-x-3 hover:bg-gray-50 rounded transition"
    >
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {member.username[0].toUpperCase()}
        </div>
        {member.online && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-900 truncate">{member.username}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search channels and messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 space-y-2">
        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Channel
        </Button>
        <Button variant="outline" className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Chat Sections */}
      <div className="flex-1 overflow-y-auto">
        {channels.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Channels
            </div>
            {channels.map(renderChatItem)}
          </div>
        )}
        {directMessages.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Direct Messages
            </div>
            {directMessages.map(renderChatItem)}
          </div>
        )}
        {groups.length > 0 && (
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Groups
            </div>
            {groups.map(renderChatItem)}
          </div>
        )}

        {/* Members */}
        <div className="mb-4">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Members
          </div>
          {members.length > 0 ? (
            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {members.map(renderMember)}
            </div>
          ) : (
            <p className="px-4 text-sm text-gray-500">No members found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
