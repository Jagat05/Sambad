import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

// POST: Start or get existing one-to-one chat in an organization
router.post("/", async (req, res) => {
  const { userId, organizationId } = req.body;

  try {
    // Find existing chat between current user and userId in organization
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [req.userId, userId] },
      organizationId,
    }).populate("members", "-password");

    if (!chat) {
      chat = new Chat({
        members: [req.userId, userId],
        organizationId,
        isGroupChat: false,
      });
      await chat.save();
      chat = await chat.populate("members", "-password");
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Chat creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: Get all chats for current user in an organization
router.get("/:organizationId", async (req, res) => {
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

// GET: Get info about specific chat by id
router.get("/chat-info/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "members",
      "-password"
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat info" });
  }
});

// POST: Create a new channel
router.post("/create-channel", async (req, res) => {
  const { organizationId, chatName, isPrivate, members } = req.body;

  if (!chatName || !organizationId || !members || members.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const channel = new Chat({
      chatName,
      isGroupChat: true,
      type: "channel",
      isPrivate: isPrivate || false,
      members,
      organizationId,
    });

    await channel.save();
    const populated = await channel.populate("members", "-password");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Channel Error:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// POST: Create a new group
router.post("/create-group", async (req, res) => {
  const { organizationId, chatName, members } = req.body;

  if (!chatName || !organizationId || !members || members.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const group = new Chat({
      chatName,
      isGroupChat: true,
      type: "group",
      isPrivate: true,
      members,
      organizationId,
    });

    await group.save();
    const populated = await group.populate("members", "-password");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

export default router;
