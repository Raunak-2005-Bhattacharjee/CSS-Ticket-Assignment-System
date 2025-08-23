import express from "express";
import { authenticate, requireRoles } from "../middlewares/auth.js";
import { login, seedJunior, signup, getCurrentUser } from "../controllers/userController.js";
import Ticket from "../models/ticket.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

// Get current user information
router.get("/me", authenticate, getCurrentUser);

// Senior can seed juniors with skills
router.post("/seed-junior", authenticate, requireRoles("senior"), seedJunior);

export default router;


