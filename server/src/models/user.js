// models/User.ts or models/User.js

import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee", "intern"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // confirmPassword is used only in frontend validation; don't store it in DB
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
