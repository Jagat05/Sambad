"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import { MessageSquare, Settings, Users, Building2 } from "lucide-react";

import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { UserProfile } from "@/components/UserProfile";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import OrganizationPage from "@/components/OrganizationPage";

import { setSelectedChat } from "@/redux/reducerSlices/chatSlice";
import { setSelectedOrganization } from "@/redux/reducerSlices/organizationSlice";

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  type?: "channel" | "group" | "dm";
  isPrivate?: boolean;
  members: { _id: string; email: string }[];
}

export default function Home() {
  const dispatch = useDispatch();

  // Selectors from Redux with typed state (you can type your store to avoid `any`)
  const token = useSelector((state: any) => state.user.token);
  const username = useSelector((state: any) => state.user.username);
  const selectedChat = useSelector(
    (state: any) => state.chat.selectedChat
  ) as Chat | null;
  const selectedOrganization = useSelector(
    (state: any) => state.organization.selectedOrganization
  );

  // Local state for org data, loading and error
  const [orgData, setOrgData] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [errorOrg, setErrorOrg] = useState<string | null>(null);

  // Fetch organization full data when selectedOrganization changes
  useEffect(() => {
    if (!selectedOrganization?.id) {
      setOrgData(null);
      dispatch(setSelectedChat(null)); // Reset chat when no org selected
      return;
    }

    setLoadingOrg(true);
    setErrorOrg(null);

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${selectedOrganization.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setOrgData(res.data);
        dispatch(setSelectedChat(null)); // Clear chat on org change
      })
      .catch(() => {
        setOrgData(null);
        setErrorOrg("Failed to load organization data.");
      })
      .finally(() => setLoadingOrg(false));
  }, [selectedOrganization, token, dispatch]);

  // Prepare members list safely for ChatSidebar
  const membersForChatSidebar = (orgData?.members ?? []).map((m: any) => ({
    id: m._id || m.id || "", // Defensive fallback for IDs
    username: m.email ? m.email.split("@")[0] : "unknown",
    online: false, // You can add real online status integration later
  }));

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-xl border-r flex flex-col">
        {/* Header */}
        <header className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b">
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
              onClick={() => setShowProfile((v) => !v)}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30"
              aria-label="User Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Organization Selector */}
        <OrganizationSelector
          onSelect={(org) => dispatch(setSelectedOrganization(org))}
        />

        {/* User Profile Modal */}
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

        {/* Chat Sidebar or loading/error info */}
        {loadingOrg ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading organization...
          </div>
        ) : errorOrg ? (
          <div className="p-4 text-center text-red-500 text-sm">{errorOrg}</div>
        ) : orgData ? (
          <ChatSidebar
            selectedChat={selectedChat?._id ?? null}
            onSelectChat={(chat) => dispatch(setSelectedChat(chat))}
            organizationId={orgData.id}
            members={membersForChatSidebar}
          />
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Select an organization to see chats and members.
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatArea chatId={selectedChat._id} />
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
      </main>
    </div>
  );
}
