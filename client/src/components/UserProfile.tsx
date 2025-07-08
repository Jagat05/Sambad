"use client";

import { User, Settings, Bell, Shield, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/redux/reducerSlices/userSlice";
import { disconnectSocket } from "@/utils/socket";

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile = ({ onClose }: UserProfileProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Select username from Redux store
  const username = useSelector((state: any) => state.user.username);
  const userEmail = useSelector((state: any) => state.user.email);
  // Get first letter of username or fallback to '?'
  const userInitial = username?.charAt(0)?.toUpperCase() || "?";
  const handleLogout = () => {
    disconnectSocket();
    dispatch(logoutUser()); // Reset Redux user state
    localStorage.removeItem("user"); // Optional: clear localStorage
    router.push("/login"); // Redirect to login
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Profile</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
          {userInitial}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{username}</h4>
          <p className="text-sm text-gray-600">{userEmail}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm hover:bg-gray-200"
        >
          <User className="w-4 h-4 mr-3" />
          Edit Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm hover:bg-gray-200"
        >
          <Bell className="w-4 h-4 mr-3" />
          Notifications
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm hover:bg-gray-200"
        >
          <Shield className="w-4 h-4 mr-3" />
          Privacy
        </Button>

        {/* 🔴 Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Log Out
        </Button>
      </div>
    </div>
  );
};
