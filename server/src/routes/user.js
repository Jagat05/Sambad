import { Router } from "express";
import User from "../models/user.js";
const Userrouter = Router();

// Userrouter.get("/", (req, res) => {
//   res.send("Hello World!");
// });
Userrouter.post("/Register", async (req, res) => {
  // Validate the request body
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("User already exists");
  } else await User.create(req.body);
  res.send("User created!");
});
Userrouter.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});
// Userrouter.post("/Register", (req, res) => {
//   res.send("User created!");
//   User.create(req.body);
// });
// Userrouter.post("/Register", (req, res) => {
//   res.send("User created!");
//   User.create(req.body);
// });

export default Userrouter;
