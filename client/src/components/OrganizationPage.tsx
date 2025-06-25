"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Org {
  id: string;
  name: string;
  code: string;
  memberCount?: number;
  members?: Array<{ id: string; email: string }>;
}

export default function OrganizationPage({
  organization,
}: {
  organization: Org;
}) {
  const token = useSelector((s: any) => s.user.token);
  const [orgData, setOrgData] = useState<Org>(organization);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setOrgData(res.data))
      .catch(() => toast.error("Failed to load organization"));
  }, [organization.id, token]);

  const invite = () => {
    if (!newEmail.trim()) return toast.error("Please enter an email.");
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}/invite`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Invitation sent!");
        setNewEmail("");
        return axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      })
      .then((res) => setOrgData(res.data))
      .catch(() => toast.error("Failed to invite member"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🏢 {orgData.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Members: {orgData.members?.length ?? orgData.memberCount ?? 0}
            </p>
          </div>
        </div>

        <Separator />

        {/* Organization Code */}
        <div className="bg-gray-50 border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700">
            Organization Code
          </h2>
          <p className="text-xl font-mono text-blue-600 mt-2">{orgData.code}</p>
          <p className="text-xs text-gray-500 mt-1">
            Share this code with others to let them join your organization.
          </p>
        </div>

        {/* Members */}
        {/* <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            👥 Members
          </h2>
          {orgData.members && orgData.members.length > 0 ? (
            <ScrollArea className="max-h-60">
              <ul className="space-y-2">
                {orgData.members.map((member) => (
                  <li
                    key={member.id || member.email}
                    className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition text-sm"
                  >
                    {member.email}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-gray-500">No members yet.</p>
          )}
        </div> */}

        {/* Invite Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            📧 Invite Member
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter an email to send an invitation to join your organization.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              type="email"
              placeholder="Enter member email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full sm:w-auto flex-1"
            />
            <Button
              onClick={invite}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
