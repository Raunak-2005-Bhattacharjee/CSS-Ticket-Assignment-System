import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "junior", "senior"] },
  skills: {
    type: [String],
    set: (arr) => Array.isArray(arr) ? arr.map((s) => String(s).toLowerCase().trim()).filter(Boolean) : [],
  },
  experience: { type: Number, default: 0 }, // Number of completed tasks
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
