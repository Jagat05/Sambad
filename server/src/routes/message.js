import express from "express";
import Message from "../models/message.js";
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

// POST /messages - Send a message
router.post("/", authenticate, async (req, res) => {
  const { chatId, content } = req.body;

  try {
    const message = await Message.create({
      chatId,
      sender: req.user.id,
      content,
    });

    const populatedMsg = await message.populate("sender", "email");
    res.json(populatedMsg);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err });
  }
});

// GET /messages/:chatId - Get all messages in a chat
router.get("/:chatId", authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).populate(
      "sender",
      "email"
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err });
  }
});

export default router;
