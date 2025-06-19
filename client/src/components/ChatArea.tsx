import { useState } from "react";
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

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: string;
  senderName?: string;
}

interface ChatAreaProps {
  chatId: string;
  organizationId: string;
}

export const ChatArea = ({ chatId, organizationId }: ChatAreaProps) => {
  const [message, setMessage] = useState("");

  // Mock messages based on chatId and organizationId
  const getMessages = (chatId: string): Message[] => {
    const messageData: Record<string, Message[]> = {
      "1": [
        {
          id: "1",
          text: "Welcome everyone to the team! Let's build something amazing together.",
          sender: "other",
          timestamp: "10:30 AM",
          senderName: "Team Lead",
        },
        {
          id: "2",
          text: "Excited to be here! Looking forward to contributing.",
          sender: "me",
          timestamp: "10:32 AM",
        },
        {
          id: "3",
          text: "Great to have you aboard! Let's start with the morning standup.",
          sender: "other",
          timestamp: "10:35 AM",
          senderName: "Sarah Johnson",
        },
      ],
      "2": [
        {
          id: "1",
          text: "The new feature is ready for testing",
          sender: "other",
          timestamp: "9:15 AM",
          senderName: "John Dev",
        },
        {
          id: "2",
          text: "Perfect! I'll start the QA process right away.",
          sender: "me",
          timestamp: "9:17 AM",
        },
        {
          id: "3",
          text: "Thanks! Let me know if you find any issues.",
          sender: "other",
          timestamp: "9:20 AM",
          senderName: "John Dev",
        },
      ],
      "4": [
        {
          id: "1",
          text: "Can we discuss the project timeline?",
          sender: "other",
          timestamp: "Yesterday 3:45 PM",
          senderName: "Sarah Johnson",
        },
        {
          id: "2",
          text: "Of course! What specific aspects would you like to review?",
          sender: "me",
          timestamp: "Yesterday 3:47 PM",
        },
        {
          id: "3",
          text: "Mainly the milestone dates and resource allocation.",
          sender: "other",
          timestamp: "Yesterday 3:50 PM",
          senderName: "Sarah Johnson",
        },
      ],
    };
    return messageData[chatId] || [];
  };

  const messages = getMessages(chatId);
  const chatInfo = getChatInfo(chatId);

  function getChatInfo(chatId: string) {
    const chatData: Record<
      string,
      { name: string; type: string; memberCount?: number; isPrivate?: boolean }
    > = {
      "1": { name: "general", type: "channel", memberCount: 45 },
      "2": { name: "development", type: "channel", memberCount: 12 },
      "3": {
        name: "design-team",
        type: "channel",
        memberCount: 8,
        isPrivate: true,
      },
      "4": { name: "Sarah Johnson", type: "dm" },
      "5": { name: "Project Alpha Team", type: "group", memberCount: 6 },
      "6": { name: "creative", type: "channel", memberCount: 12 },
      "7": { name: "client-feedback", type: "channel", memberCount: 5 },
      "8": { name: "campaigns", type: "channel", memberCount: 8 },
    };
    return chatData[chatId] || { name: "Unknown Chat", type: "channel" };
  }

  const getIcon = () => {
    if (chatInfo.type === "channel") {
      return chatInfo.isPrivate ? (
        <Lock className="w-5 h-5" />
      ) : (
        <Hash className="w-5 h-5" />
      );
    }
    if (chatInfo.type === "group") {
      return <Users className="w-5 h-5" />;
    }
    return null;
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getIcon() || (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {chatInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900 flex items-center">
                  {chatInfo.name}
                  {chatInfo.isPrivate && (
                    <Lock className="w-4 h-4 ml-2 text-gray-400" />
                  )}
                </h2>
                {chatInfo.type === "dm" ? (
                  <p className="text-sm text-green-600">Online</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {chatInfo.memberCount} members
                    {chatInfo.type === "channel" && " in this channel"}
                    {chatInfo.type === "group" && " in this group"}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {chatInfo.type === "dm" && (
              <>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <Video className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                msg.sender === "me"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white text-gray-800 shadow-sm border border-gray-200"
              }`}
            >
              {msg.sender === "other" &&
                msg.senderName &&
                chatInfo.type !== "dm" && (
                  <p className="text-xs text-gray-500 mb-1 font-semibold">
                    {msg.senderName}
                  </p>
                )}
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === "me" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder={`Message ${
                chatInfo.type === "channel"
                  ? "#" + chatInfo.name
                  : chatInfo.name
              }...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-12 bg-gray-100 border-gray-300 focus:bg-white rounded-full"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-200"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
