import { User, Settings, Bell, Shield, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile = ({ onClose }: UserProfileProps) => {
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

      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
          JD
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">John Doe</h4>
          <p className="text-sm text-gray-600">john.doe@example.com</p>
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
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
