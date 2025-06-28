import express from "express";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
const router = express.Router();

// POST: Start or Get one-to-one chat
router.post("/", async (req, res) => {
  const { userId, organizationId } = req.body;

  try {
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

// GET: Get all chats for a user in an org
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

// GET: Get specific chat info
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

export default router;
