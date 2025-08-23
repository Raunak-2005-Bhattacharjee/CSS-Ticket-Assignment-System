import Ticket from "../../models/ticket.js";
import { inngest } from "../client.js";
import { getRequiredSkillsFromGemini } from "../../services/gemini.js";

export const onTicketCreated = inngest.createFunction(
  { id: "ticket-created-workflow" },
  { event: "ticket/created" },
  async ({ event, step }) => {
    const { ticketId } = event.data;

    const ticket = await step.run("load-ticket", async () => {
      const doc = await Ticket.findById(ticketId).lean();
      if (!doc) throw new Error("Ticket not found");
      return doc;
    });

    const { title, description } = ticket;

    const enriched = await step.run("extract-required-skills", async () => {
      return await getRequiredSkillsFromGemini({ title, description });
    });

    const relatedSkills = (enriched.requiredSkills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
    const helpfulNotes = enriched.notes || null;

    await step.run("update-ticket-enrichment", async () => {
      await Ticket.findByIdAndUpdate(ticket._id, {
        $set: { relatedSkills, helpfulNotes },
      });
    });

    return {
      enriched: true,
      relatedSkills,
      helpfulNotes,
    };
  }
);


