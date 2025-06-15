// const express = require("express");
import express from "express";
import connectDB from "./db/conn.js";
import Userrouter from "./routes/user.js";
import cors from "cors";
const app = express();
const port = 8080;

// Connect to the database
connectDB();
app.use(cors());
app.use(express.json());
app.use(Userrouter);

// Import routes
// import userRouter from "./routes/user.js";
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
