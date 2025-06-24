"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      .catch(() => toast.error("Load failed"));
  }, [organization.id, token]);

  const invite = () => {
    if (!newEmail.trim()) return toast.error("Email required");
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}/invite`,
        { email: newEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        toast.success("Invited!");
        setNewEmail("");
        return axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/organizations/${organization.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      })
      .then((res) => setOrgData(res.data))
      .catch(() => toast.error("Invite failed"));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🏢 {orgData.name}</h1>
      <p className="text-gray-600">
        Members: {orgData.members?.length ?? orgData.memberCount ?? 0}
      </p>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Invite member</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button onClick={invite}>Invite</Button>
        </div>
      </div>

      {/* Organization Code Section */}
      <div className="mt-6 p-4 bg-gray-50 border rounded-md">
        <h3 className="text-sm font-semibold text-gray-700">
          Organization Code
        </h3>
        <div className="text-blue-600 font-mono text-lg">{orgData.code}</div>
        <p className="text-xs text-gray-500 mt-1">
          Share this code to let others join your organization.
        </p>
      </div>
    </div>
  );
}
