import jwt from "jsonwebtoken";

export const socketHandler = (io) => {
  // Authenticate socket connections using JWT token from handshake
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
    // console.log("🟢 User connected:", socket.id, "UserID:", socket.userId);

    // Listen for client to join specific chat room
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      // console.log(`📥 User ${socket.userId} joined chat: ${chatId}`);
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      // console.log("🔴 User disconnected:", socket.id);
    });
  });
};
