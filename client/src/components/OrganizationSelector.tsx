"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOrganization } from "@/redux/reducerSlices/organizationSlice";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  avatar: string;
  role: string;
  memberCount: number;
}

export const OrganizationSelector = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const selectedOrgFromRedux = useSelector(
    (state: any) => state.organization.selectedOrganization
  );

  // Sync selectedOrg state with redux store
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (selectedOrgFromRedux) {
      setSelectedOrg(selectedOrgFromRedux);
    }
  }, [selectedOrgFromRedux]);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get("http://localhost:8080/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrganizations(res.data);

      if (res.data.length > 0) {
        const orgToSelect = res.data[0];
        setSelectedOrg(orgToSelect);
        dispatch(setSelectedOrganization(orgToSelect));
      } else {
        // No orgs yet, clear selection
        setSelectedOrg(null);
        dispatch(setSelectedOrganization(null));
      }
    } catch (err) {
      toast.error("Failed to load organizations");
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/organizations",
        { name: orgName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newOrg = res.data.organization || res.data; // depends on backend response structure
      toast.success("✅ Organization created!");

      setOrganizations((prev) => [...prev, newOrg]);
      setSelectedOrg(newOrg);
      dispatch(setSelectedOrganization(newOrg));

      setOrgName("");
      setShowCreateModal(false);
      setIsDropdownOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create organization"
      );
    }
  };

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    dispatch(setSelectedOrganization(org));
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {selectedOrg?.avatar || "?"}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm">
                {selectedOrg?.name || "Select Organization"}
              </h3>
              <p className="text-xs text-gray-600">
                {selectedOrg?.memberCount ?? 0} members
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 max-h-60 overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 ${
                    selectedOrg?.id === org.id
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
              <Button
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => setShowCreateModal(true)}
              >
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

      {/* Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Please enter the name of your new organization.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Button className="mt-4 w-full" onClick={handleCreateOrganization}>
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
