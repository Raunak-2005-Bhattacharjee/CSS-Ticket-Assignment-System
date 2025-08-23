import bcrypt from "bcrypt";
import User from "../models/user.js";
import { signAccessToken } from "../middlewares/auth.js";

export async function signup(req, res) {
  try {
    const { email, password, role, skills } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).toLowerCase().trim())
      : [];
    const user = await User.create({ email, password: hash, role, skills: normalizedSkills });
    const token = signAccessToken({ id: user._id.toString(), role: user.role });

    return res
      .status(201)
      .json({ success: true, user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const token = signAccessToken({ id: user._id.toString(), role: user.role });
    return res.json({ success: true, token });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function seedJunior(req, res) {
  try {
    const { email, password, skills } = req.body;
    const hash = await bcrypt.hash(password || "password", 10);
    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).toLowerCase().trim())
      : [];
    const user = await User.create({ email, password: hash, role: "junior", skills: normalizedSkills });

    return res.status(201).json({ success: true, user });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
}


