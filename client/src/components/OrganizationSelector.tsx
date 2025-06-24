"use client";

import { useEffect, useState, useRef, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
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
import { setSelectedOrganization } from "@/redux/reducerSlices/organizationSlice";

interface Organization {
  id: string;
  name: string;
  avatar: string;
  role: string;
  memberCount: number;
  code: string;
}

interface Props {
  onSelect?: (org: Organization) => void;
}

export const OrganizationSelector: React.FC<Props> = ({ onSelect }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selOrg, setSelOrg] = useState<Organization | null>(null);

  // New states for Join Organization feature
  const [showJoin, setShowJoin] = useState<boolean>(false);
  const [joinCode, setJoinCode] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.user.token);
  const selectedReduxOrg = useSelector(
    (state: any) => state.organization.selectedOrganization
  );

  useEffect(() => {
    if (selectedReduxOrg) {
      setSelOrg(selectedReduxOrg);
    }
  }, [selectedReduxOrg]);

  useEffect(() => {
    fetchOrganizations();

    const handleClickOutside = (e: MouseEvent | Event) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      ) {
        setOpen(false);
        setShowJoin(false); // close join input if open and clicking outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrganizations(res.data);
    } catch (err) {
      toast.error("❌ Failed to load organizations");
    }
  };

  const handleCreate = async () => {
    if (!orgName.trim()) return toast.error("⚠️ Name is required");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations`,
        { name: orgName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newOrg: Organization = res.data.organization || res.data;
      toast.success("✅ Organization created!");

      setOrganizations((prev) => [...prev, newOrg]);
      selectOrg(newOrg);
      setOrgName("");
      setShowCreate(false);
    } catch (err) {
      toast.error("❌ Failed to create organization");
    }
  };

  const selectOrg = (org: Organization) => {
    setSelOrg(org);
    dispatch(setSelectedOrganization(org));
    if (onSelect) onSelect(org);
    setOpen(false);
    setShowJoin(false); // close join input if open
  };

  // New join organization function
  const handleJoin = async () => {
    if (!joinCode.trim())
      return toast.error("⚠️ Organization code is required");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/join`,
        { code: joinCode.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ Joined organization!");
      setJoinCode("");
      setShowJoin(false);
      fetchOrganizations();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "❌ Failed to join organization"
      );
    }
  };

  return (
    <div
      className="p-4 border-b border-gray-200 bg-gray-50 relative z-10"
      ref={dropdownRef}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
            {selOrg?.avatar || "?"}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">
              {selOrg?.name || "Select Organization"}
            </h3>
            <p className="text-xs text-gray-600">
              {selOrg?.memberCount ?? 0} members
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => selectOrg(org)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 ${
                  selOrg?.id === org.id
                    ? "bg-blue-50 border border-blue-200"
                    : ""
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {org.avatar}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {org.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {org.role} • {org.memberCount} members
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Create Organization
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => setShowJoin((prev) => !prev)}
            >
              🔗 Join Organization
            </Button>

            {showJoin && (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Enter organization code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <Button onClick={handleJoin}>Join</Button>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start text-sm mt-2"
            >
              <Settings className="w-4 h-4 mr-2" /> Manage Organizations
            </Button>
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>Enter organization name</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Organization name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
          <Button className="mt-4 w-full" onClick={handleCreate}>
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
