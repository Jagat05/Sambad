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
 * @route   POST /api/organizations
 * @desc    Create a new organization
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
 * @route   GET /api/organizations
 * @desc    Get all organizations the user belongs to
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
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Fetch Orgs Error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching organizations" });
  }
});

export default router;
