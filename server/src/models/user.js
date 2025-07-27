import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email"],
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    avatar: { type: String },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
