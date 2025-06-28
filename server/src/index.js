import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./db/conn.js";
import Userrouter from "./routes/user.js";
import organizationRoutes from "./routes/organization.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import { authenticate } from "./middleware/authenticate.js";

dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080;

// Setup HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ Frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Attach io to app for global use (if needed)
// app.set("io", io);
// ✅ Add this middleware BEFORE your routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use(Userrouter);
app.use(organizationRoutes);
app.use("/chat", authenticate, chatRoutes);
app.use("/messages", authenticate, messageRoutes);

// Socket.IO Events for real-time chat
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join a chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`📥 User joined chat: ${chatId}`);
  });
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
