import express from "express";
import connectDB from "./db/conn.js";
import Userrouter from "./routes/user.js";
import organizationRoutes from "./routes/organization.js";
// server.js or index.js
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";

import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
// const port = process.env.PORT || 8080;
const port = process.env.PORT;

connectDB();

app.use(cors());
app.use(express.json());

app.use(Userrouter); // /register, /login, etc.
app.use(organizationRoutes); // /organizations
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
