import express from "express";
import { authenticate, requireRoles } from "../middlewares/auth.js";
import { 
  completeTicket, 
  createTicket, 
  deleteTicket, 
  getMyTickets,
  getUnassignedTickets,
  getAvailableJuniors,
  assignTicket,
  unassignTicket,
  getAllTickets
} from "../controllers/ticketController.js";

const router = express.Router();

// Create ticket (senior only)
router.post("/", authenticate, requireRoles("senior"), createTicket);

// Get my created tickets (senior) or assigned tickets (junior)
router.get("/me", authenticate, getMyTickets);

// Get all tickets (senior only)
router.get("/all", authenticate, requireRoles("senior"), getAllTickets);

// Get unassigned tickets (senior only)
router.get("/unassigned", authenticate, requireRoles("senior"), getUnassignedTickets);

// Get available juniors (senior only)
router.get("/juniors", authenticate, requireRoles("senior"), getAvailableJuniors);

// Assign ticket to junior (senior only)
router.post("/assign", authenticate, requireRoles("senior"), assignTicket);

// Unassign ticket (senior only)
router.patch("/:id/unassign", authenticate, requireRoles("senior"), unassignTicket);

// Mark a ticket as completed (junior only; must be assigned to the junior)
router.patch(
  "/:id/complete",
  authenticate,
  requireRoles("junior"),
  completeTicket
);

// Delete a ticket (senior only; must be creator)
router.delete("/:id", authenticate, requireRoles("senior"), deleteTicket);

export default router;


