"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { UserProfile } from "@/components/UserProfile";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { MessageSquare, Settings, Users, Building2 } from "lucide-react";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("1");

  // Select username from Redux store
  const username = useSelector((state: any) => state.user.username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sambad</h1>
                <p className="text-blue-100 text-sm">Stay Connected</p>
              </div>
            </div>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Organization Selector */}
        <OrganizationSelector />

        {/* User Profile */}
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

        {/* Chat Sidebar */}
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          organizationId={selectedOrganization}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatArea
            chatId={selectedChat}
            organizationId={selectedOrganization}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white/50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, {username || "Guest"} 👋
              </h2>
              <p className="text-gray-600 mb-6">
                You’re successfully logged into{" "}
                <span className="font-semibold">Sambad</span>. Start chatting
                with your team or join an organization.
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Connect with your team
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
