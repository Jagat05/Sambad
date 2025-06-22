import express from "express";
import connectDB from "./db/conn.js";
import Userrouter from "./routes/user.js";
import organizationRoutes from "./routes/organization.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

connectDB();

app.use(cors());
app.use(express.json());

app.use(Userrouter); // /register, /login, etc.
app.use(organizationRoutes); // /organizations, no /api prefix

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
