import { useState } from "react";
import { Building2, ChevronDown, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organization {
  id: string;
  name: string;
  avatar: string;
  role: string;
  memberCount: number;
}

interface OrganizationSelectorProps {
  selectedOrganization: string;
  onSelectOrganization: (orgId: string) => void;
}

export const OrganizationSelector = ({
  selectedOrganization,
  onSelectOrganization,
}: OrganizationSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock organization data
  const organizations: Organization[] = [
    {
      id: "1",
      name: "TechCorp Inc",
      avatar: "TC",
      role: "Admin",
      memberCount: 45,
    },
    {
      id: "2",
      name: "Design Studio",
      avatar: "DS",
      role: "Member",
      memberCount: 12,
    },
    {
      id: "3",
      name: "Marketing Team",
      avatar: "MT",
      role: "Member",
      memberCount: 8,
    },
  ];

  const currentOrg = organizations.find(
    (org) => org.id === selectedOrganization
  );

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {currentOrg?.avatar}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm">
                {currentOrg?.name}
              </h3>
              <p className="text-xs text-gray-600">
                {currentOrg?.memberCount} members
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrganization(org.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedOrganization === org.id
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {org.avatar}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {org.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {org.role} • {org.memberCount} members
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-2">
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Settings className="w-4 h-4 mr-2" />
                Manage Organizations
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
