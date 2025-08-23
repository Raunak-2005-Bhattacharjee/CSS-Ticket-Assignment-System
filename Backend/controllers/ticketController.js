import Ticket from "../models/ticket.js";
import User from "../models/user.js";
import { inngest } from "../inngest/client.js";

export async function createTicket(req, res) {
  try {
    const { title, description, priority, deadline } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || "medium",
      deadline: deadline ? new Date(deadline) : undefined,
      createdBy: req.user.id,
    });

    Promise.resolve(
      inngest.send({ name: "ticket/created", data: { ticketId: ticket._id.toString() } })
    ).catch((err) => {
      console.error("Failed to emit ticket/created:", err);
    });

    return res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create ticket" });
  }
}

export async function getMyTickets(req, res) {
  try {
    const role = req.user.role;
    let query = {};
    if (role === "senior") query = { createdBy: req.user.id };
    else if (role === "junior") query = { assignedTo: req.user.id };
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, tickets });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
}

export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id, createdBy: req.user.id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    await Ticket.deleteOne({ _id: id });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete ticket" });
  }
}

export async function completeTicket(req, res) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id, assignedTo: req.user.id });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found or not assigned to you" });
    }
    if (ticket.status === "COMPLETED") {
      return res.json({ success: true, ticket });
    }
    
    // Update ticket status
    ticket.status = "COMPLETED";
    await ticket.save();
    
    // Increment junior's experience
    const User = (await import("../models/user.js")).default;
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { experience: 1 }
    });
    
    return res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to complete ticket" });
  }
}

export async function getUnassignedTickets(req, res) {
  try {
    if (req.user.role !== "senior") {
      return res.status(403).json({ success: false, message: "Access denied. Seniors only." });
    }

    const tickets = await Ticket.find({ 
      assignedTo: null,
      status: "TODO"
    })
    .populate("createdBy", "email")
    .sort({ createdAt: -1 });

    return res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch unassigned tickets" });
  }
}

export async function getAvailableJuniors(req, res) {
  try {
    if (req.user.role !== "senior") {
      return res.status(403).json({ success: false, message: "Access denied. Seniors only." });
    }

    const juniors = await User.find({ role: "junior" })
      .select("_id email skills experience")
      .sort({ experience: -1, email: 1 }); // Sort by experience (highest first), then by email

    return res.json({ success: true, juniors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch available juniors" });
  }
}

export async function assignTicket(req, res) {
  try {
    if (req.user.role !== "senior") {
      return res.status(403).json({ success: false, message: "Access denied. Seniors only." });
    }

    const { ticketId, juniorId } = req.body;

    if (!ticketId || !juniorId) {
      return res.status(400).json({ success: false, message: "Ticket ID and Junior ID are required" });
    }

    // Verify ticket exists and is unassigned
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.assignedTo) {
      return res.status(400).json({ success: false, message: "Ticket is already assigned" });
    }

    // Verify junior exists
    const junior = await User.findById(juniorId);
    if (!junior || junior.role !== "junior") {
      return res.status(404).json({ success: false, message: "Junior not found" });
    }

    // Assign ticket to junior
    await Ticket.findByIdAndUpdate(ticketId, {
      $set: { 
        assignedTo: juniorId, 
        status: "IN_PROGRESS" 
      }
    });

    return res.json({ 
      success: true, 
      message: "Ticket assigned successfully",
      ticket: await Ticket.findById(ticketId).populate("assignedTo", "email")
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to assign ticket" });
  }
}

export async function getAllTickets(req, res) {
  try {
    if (req.user.role !== "senior") {
      return res.status(403).json({ success: false, message: "Access denied. Seniors only." });
    }

    const tickets = await Ticket.find({})
      .populate("createdBy", "email")
      .populate("assignedTo", "email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, tickets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
}

export async function unassignTicket(req, res) {
  try {
    if (req.user.role !== "senior") {
      return res.status(403).json({ success: false, message: "Access denied. Seniors only." });
    }

    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (!ticket.assignedTo) {
      return res.status(400).json({ success: false, message: "Ticket is not assigned" });
    }

    // Unassign ticket
    await Ticket.findByIdAndUpdate(ticketId, {
      $set: { 
        assignedTo: null, 
        status: "TODO" 
      }
    });

    return res.json({ 
      success: true, 
      message: "Ticket unassigned successfully" 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to unassign ticket" });
  }
}


