import express from "express";
import Chat from "../models/chat.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// POST /chat - Create or fetch a one-on-one chat
router.post("/", authenticate, async (req, res) => {
  const { userId, organizationId } = req.body;

  try {
    let chat = await Chat.findOne({
      organizationId,
      isGroupChat: false,
      members: { $all: [req.user.id, userId], $size: 2 },
    });

    if (!chat) {
      chat = await Chat.create({
        organizationId,
        members: [req.user.id, userId],
      });
    }

    chat = await chat.populate("members", "email");
    res.json(chat);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create or fetch chat", error: err });
  }
});

// GET /chat/:organizationId - Get all chats in an organization for current user
router.get("/:organizationId", authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      organizationId: req.params.organizationId,
      members: req.user.id,
    }).populate("members", "email");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats", error: err });
  }
});

// ✅ GET /chat-info/:chatId - Get single chat info
router.get("/chat-info/:chatId", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "members",
      "email"
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chat info", error: err });
  }
});

export default router;
