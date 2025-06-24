import express from "express";
import Organization from "../models/organization.js";
import User from "../models/User.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Utility to generate unique code
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await Organization.findOne({ code });
  }
  return code;
};

/**
 * Create a new organization
 */
router.post("/organizations", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    const code = await generateUniqueCode();

    const newOrganization = new Organization({
      name,
      code,
      createdBy: req.userId,
      members: [req.userId],
    });

    await newOrganization.save();

    await User.findByIdAndUpdate(req.userId, {
      role: "admin",
      organizationId: newOrganization._id,
    });

    res.status(201).json({
      message: "Organization created successfully",
      organization: {
        id: newOrganization._id,
        name: newOrganization.name,
        code: newOrganization.code,
        avatar: name.charAt(0).toUpperCase(),
        memberCount: 1,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Create Org Error:", error);
    res
      .status(500)
      .json({ message: "Server error while creating organization" });
  }
});

/**
 * Get all organizations the user belongs to
 */
router.get("/organizations", authenticate, async (req, res) => {
  try {
    const orgs = await Organization.find({ members: req.userId });

    const formatted = orgs.map((org) => ({
      id: org._id,
      name: org.name,
      avatar: org.name.charAt(0).toUpperCase(),
      memberCount: org.members.length,
      role: org.createdBy.toString() === req.userId ? "admin" : "member",
      code: org.code, // Include code here
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Fetch Orgs Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching organizations" });
  }
});

/**
 * Get organization details by id
 */
router.get("/organizations/:id", authenticate, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).populate(
      "members",
      "username email"
    );

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.status(200).json({
      id: org._id,
      name: org.name,
      code: org.code,
      avatar: org.name.charAt(0).toUpperCase(),
      memberCount: org.members.length,
      members: org.members,
      role: org.createdBy.toString() === req.userId ? "admin" : "member",
    });
  } catch (error) {
    console.error("Fetch Org Details Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching organization details" });
  }
});

/**
 * Invite member by email
 */
router.post("/organizations/:id/invite", authenticate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const org = await Organization.findById(req.params.id);
    const user = await User.findOne({ email });

    if (!org || !user) {
      return res
        .status(404)
        .json({ message: "Organization or user not found" });
    }

    // Only admin can invite
    if (org.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Only admin can invite members" });
    }

    // Prevent duplicates
    if (org.members.includes(user._id)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    org.members.push(user._id);
    await org.save();

    res.status(200).json({ message: "Member invited successfully" });
  } catch (error) {
    console.error("Invite Member Error:", error);
    res.status(500).json({ message: "Server error while inviting member" });
  }
});
/**
 * Join organization by code
 */
router.post("/organizations/join", authenticate, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Organization code is required" });
    }

    const org = await Organization.findOne({ code: code.toUpperCase() });

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if user already a member
    if (org.members.includes(req.userId)) {
      return res
        .status(400)
        .json({ message: "Already a member of this organization" });
    }

    org.members.push(req.userId);
    await org.save();

    // Optionally update user role and org ID if needed here
    // await User.findByIdAndUpdate(req.userId, { organizationId: org._id, role: "member" });

    res.status(200).json({ message: "Successfully joined the organization" });
  } catch (error) {
    console.error("Join Organization Error:", error);
    res
      .status(500)
      .json({ message: "Server error while joining organization" });
  }
});

export default router;
