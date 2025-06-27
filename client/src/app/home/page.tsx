"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import { MessageSquare, Settings, Users, Building2 } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { UserProfile } from "@/components/UserProfile";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import OrganizationPage from "@/components/OrganizationPage";

export default function Home() {
  const token = useSelector((s: any) => s.user.token);
  const username = useSelector((s: any) => s.user.username);

  // const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch full organization data when selectedOrganization changes
  useEffect(() => {
    if (!selectedOrganization?.id) {
      setOrgData(null);
      setSelectedChat(null);
      return;
    }

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${selectedOrganization.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setOrgData(res.data);
        setSelectedChat(null);
      })
      .catch(() => setOrgData(null));
  }, [selectedOrganization, token]);

  // Prepare members for ChatSidebar
  const membersForChatSidebar = (orgData?.members ?? []).map((m: any) => ({
    id: m.id,
    username: m.email.split("@")[0],
    online: false,
  }));

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-80 bg-white shadow-xl border-r flex flex-col">
        {/* Header with Logo & User Profile */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b">
          <div className="flex justify-between items-center">
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
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Organization Selector */}
        <OrganizationSelector onSelect={setSelectedOrganization} />

        {/* Profile Modal */}
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

        {/* Sidebar */}
        {orgData ? (
          <ChatSidebar
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            organizationId={orgData.id}
            members={membersForChatSidebar}
          />
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Select an organization to see chats and members.
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatArea chatId={selectedChat} organizationId={orgData?.id} />
        ) : orgData ? (
          <OrganizationPage organization={orgData} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white/50">
            <div className="flex flex-col items-center justify-center text-center max-w-md p-8 mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {username || "Guest"} 👋
              </h2>
              <p className="text-gray-600 mb-6">
                You’re successfully logged into{" "}
                <span className="font-semibold">Sambad</span>. Start chatting or
                join an organization.
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
}
