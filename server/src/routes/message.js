import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// POST: Send a message
router.post("/", authenticate, async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res
        .status(400)
        .json({ message: "chatId and content are required." });
    }

    let message = await Message.create({
      sender: req.userId,
      content,
      chat: chatId,
    });

    // Populate sender and chat
    await message.populate("sender", "email _id");
    await message.populate("chat");

    // Optional: populate chat members (can be used on frontend if needed)
    message = await message.populate({
      path: "chat.members",
      select: "email _id",
    });

    // Emit to all users in the chat
    req.io.to(chatId).emit("newMessage", message);

    return res.status(201).json(message);
  } catch (err) {
    console.error("❌ Send message error:", err);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

// GET: Fetch all messages of a chat
router.get("/:chatId", authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "email _id")
      .sort("createdAt");

    return res.status(200).json(messages);
  } catch (err) {
    console.error("❌ Get messages error:", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
