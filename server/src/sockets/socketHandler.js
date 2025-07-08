import jwt from "jsonwebtoken";

const onlineUsers = new Map(); // userId -> socket.id

export const socketHandler = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("❌ Invalid token:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (!userId) return;

    // console.log("🟢 User connected:", userId, socket.id);

    // Add user to map
    onlineUsers.set(userId, socket.id);

    // ✅ Send list of current online users to this socket
    socket.emit("online-users", Array.from(onlineUsers.keys()));

    // Notify others that this user is online
    socket.broadcast.emit("user-online", { userId });

    socket.on("joinChat", (chatId) => {
      if (chatId) {
        socket.join(chatId);
        // console.log(`📥 ${userId} joined chat room: ${chatId}`);
      }
    });

    socket.on("disconnect", () => {
      // console.log("🔴 User disconnected:", userId);
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  io.getOnlineUsers = () => Array.from(onlineUsers.keys());
};
