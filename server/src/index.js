// const express = require("express");
import express from "express";
import connectDB from "./db/conn.js";
const app = express();
const port = 8080;

// Connect to the database
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
