"use client";

import React, { useState } from "react";
import { User, Settings, Bell, Shield, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser, updateAvatar } from "@/redux/reducerSlices/userSlice";
import { disconnectSocket } from "@/utils/socket";
import axios from "axios";
import { toast } from "sonner";

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile = ({ onClose }: UserProfileProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const username = useSelector((state: any) => state.user.username);
  const userEmail = useSelector((state: any) => state.user.email);
  const avatarUrl = useSelector((state: any) => state.user.avatar);
  const userInitial = username?.charAt(0)?.toUpperCase() || "?";

  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logoutUser());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("token") || "";

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatarUrl = res.data.avatar;
      dispatch(updateAvatar(newAvatarUrl));
      toast.success("Avatar updated!");

      // ✅ Optional: Refresh the page or emit an event to update other components
      // Example using custom event:
      const event = new Event("avatar-updated");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
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

      <div className="flex items-center space-x-3 mb-4">
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer group"
          title="Click to upload avatar"
          onClick={() => document.getElementById("avatarInput")?.click()}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xl">
              {userInitial}
            </div>
          )}

          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full">
            <User className="w-6 h-6 text-white" />
          </div>

          <input
            type="file"
            accept="image/*"
            id="avatarInput"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">{username}</h4>
          <p className="text-sm text-gray-600">{userEmail}</p>
        </div>
      </div>

      {/* Actions */}
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
