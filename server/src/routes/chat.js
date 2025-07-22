import express from "express";
import mongoose from "mongoose";
import Chat from "../models/chat.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST: Start or get one-to-one chat
router.post("/", authenticate, async (req, res) => {
  const { userId, organizationId } = req.body;

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [req.userId, userId] },
      organizationId,
    }).populate("members", "-password");

    if (!chat) {
      chat = await Chat.create({
        members: [req.userId, userId],
        organizationId,
        isGroupChat: false,
        admin: req.userId, // admin always set
      });
      await chat.populate("members", "-password");
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Chat creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Get all chats in organization
router.get("/:organizationId", authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      organizationId: req.params.organizationId,
      members: req.userId,
    })
      .populate("members", "-password")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chats" });
  }
});

// GET: Chat info
router.get("/chat-info/:chatId", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "members",
      "-password"
    );
    res.json(chat);
  } catch {
    res.status(500).json({ error: "Failed to fetch chat info" });
  }
});

// POST: Create a channel
router.post("/create-channel", authenticate, async (req, res) => {
  const { organizationId, chatName, isPrivate, members } = req.body;

  if (
    !chatName ||
    !organizationId ||
    !Array.isArray(members) ||
    members.length === 0
  )
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Deduplicate members + add admin
    const allMembers = [...members, req.userId];
    const uniqueMembers = [...new Set(allMembers.map((id) => id.toString()))];

    const channel = await Chat.create({
      chatName,
      isGroupChat: true,
      type: "channel",
      isPrivate: isPrivate ?? false,
      members: uniqueMembers,
      organizationId,
      admin: req.userId,
    });

    await channel.populate("members", "-password");
    res.status(201).json(channel);
  } catch (err) {
    console.error("Channel creation error:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// POST: Create a group
router.post("/create-group", authenticate, async (req, res) => {
  const { chatName, members, organizationId } = req.body;

  if (!chatName || !members || !organizationId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Deduplicate members + add admin
    const allMembers = [...members, req.userId];
    const uniqueMembers = [...new Set(allMembers.map((id) => id.toString()))];

    const newGroup = await Chat.create({
      chatName,
      members: uniqueMembers,
      isGroupChat: true,
      organizationId,
      type: "group",
      admin: req.userId,
    });

    await newGroup.populate("members", "-password");
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Group creation error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// PATCH: Add member (only admin)
router.patch("/add-member", authenticate, async (req, res) => {
  const { chatId, userIdToAdd } = req.body;

  // console.log("Add member body:", req.body);

  if (!chatId || !userIdToAdd) {
    return res.status(400).json({ error: "chatId and userIdToAdd required" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(chatId) ||
    !mongoose.Types.ObjectId.isValid(userIdToAdd)
  ) {
    return res.status(400).json({ error: "Invalid ObjectId(s)" });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    if (chat.type !== "group")
      return res.status(400).json({ error: "Can only add members to groups" });

    if (!chat.admin?.equals(req.userId)) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    if (chat.members.some((id) => id.equals(userIdToAdd))) {
      return res.status(400).json({ error: "User is already a member" });
    }

    chat.members.push(userIdToAdd);
    await chat.save();

    await chat.populate("members", "-password");
    res.status(200).json({ message: "Member added successfully", chat });
  } catch (error) {
    // console.error("Add member error:", error);
    res.status(500).json({ error: "Failed to add member" });
  }
});

// PATCH: Remove member (only admin)
router.patch("/remove-member", authenticate, async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId)
    return res.status(400).json({ error: "chatId and userId required" });

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Group not found" });
    if (chat.type !== "group")
      return res
        .status(400)
        .json({ error: "Can only remove members from groups" });

    if (!chat.admin || !chat.admin.equals(req.userId))
      return res.status(403).json({ error: "Only admin can remove members" });

    chat.members = chat.members.filter((id) => !id.equals(userId));

    await chat.save();
    await chat.populate("members", "-password");

    res.status(200).json({ message: "Member removed", chat });
  } catch (err) {
    // console.error("Remove member error:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// DELETE: Delete chat (only admin)
router.delete("/:chatId", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    if (!chat.admin || !chat.admin.equals(req.userId))
      return res.status(403).json({ error: "Only admin can delete" });

    await chat.deleteOne();
    res.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
