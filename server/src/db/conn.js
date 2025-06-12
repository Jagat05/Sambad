import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const res = await mongoose.connect("mongodb://127.0.0.1:27017/sambad", {});
    if (res) {
      console.log(`MongoDB Connected...`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
};

export default connectDB;
