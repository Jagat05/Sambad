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

import { socketHandler } from "./sockets/socketHandler.js"; // << import here

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(Userrouter);
app.use(organizationRoutes);
app.use("/chat", authenticate, chatRoutes);
app.use("/messages", authenticate, messageRoutes);

// Pass io to your socket handler module
socketHandler(io);

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
