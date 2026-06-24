import Event from "../models/event.model.js";
import Problem from "../models/problem.model.js";
import { getGeminiClient } from "../config/gemini.js";

const withTimeout = (promise, ms = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini request timed out")), ms)
    ),
  ]);
};

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getCampusContext = async () => {
  const [events, problems] = await Promise.all([
    Event.find({})
      .select(
        "title category venue startDate endDate status capacity registeredCount department"
      )
      .sort({ startDate: 1 })
      .limit(8)
      .lean(),

    Problem.find({})
      .select("title category location status priority description createdAt")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const eventContext =
    events.length > 0
      ? events
          .map((event, index) => {
            return `${index + 1}. ${event.title}
Category: ${event.category || "N/A"}
Venue: ${event.venue || "N/A"}
Starts: ${formatDate(event.startDate)}
Status: ${event.status || "N/A"}
Seats: ${event.registeredCount || 0}/${event.capacity || 0}`;
          })
          .join("\n\n")
      : "No events found in database.";

  const problemContext =
    problems.length > 0
      ? problems
          .map((problem, index) => {
            return `${index + 1}. ${problem.title}
Category: ${problem.category || "N/A"}
Location: ${problem.location || "N/A"}
Priority: ${problem.priority || "N/A"}
Status: ${problem.status || "N/A"}`;
          })
          .join("\n\n")
      : "No problems found in database.";

  return {
    eventContext,
    problemContext,
  };
};

const buildPrompt = ({ question, user, eventContext, problemContext }) => {
  return `
You are CampusConnect AI, the assistant for a college event management and campus problem reporting website.

Current user:
Name: ${user?.name || "Unknown"}
Role: ${user?.role || "guest"}
Department: ${user?.department || "Unknown"}
Year: ${user?.year || "Unknown"}

Platform features:
- Students browse approved events.
- Students register for approved events.
- Students see QR tickets at /dashboard/tickets.
- Organizers create events at /dashboard/events/create.
- Admins approve events at /dashboard/admin/events.
- Organizers and admins verify tickets at /dashboard/verify-ticket.
- Students report campus problems at /dashboard/problems/create.
- Admins and moderators manage campus problems.
- Notifications show registration, approval, rejection, and ticket updates.

Current events from database:
${eventContext}

Current problems from database:
${problemContext}

Rules:
- Give simple, helpful answers.
- Use current events/problems only from the context above.
- Do not invent ticket codes, users, or registrations.
- If data is unavailable, say it is not available.
- Keep answer concise.

User question:
${question}
`;
};

export const askCampusAI = async ({ question, user }) => {
  try {
    console.log("AI SERVICE: started");
    console.log("AI MODE:", process.env.AI_MODE);
    console.log("GEMINI MODEL:", process.env.GEMINI_MODEL);
    console.log("GEMINI KEY EXISTS:", Boolean(process.env.GEMINI_API_KEY));

    const ai = getGeminiClient();

    console.log("AI SERVICE: fetching DB context");
    const { eventContext, problemContext } = await getCampusContext();

    console.log("AI SERVICE: building prompt");
    const prompt = buildPrompt({
      question,
      user,
      eventContext,
      problemContext,
    });

    console.log("AI SERVICE: calling Gemini");

    const interaction = await withTimeout(
      ai.interactions.create({
        model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
        input: prompt,
      }),
      25000
    );

    console.log("AI SERVICE: Gemini returned");

    return {
      answer:
        interaction.output_text ||
        "I could not generate an answer right now. Please try again.",
      sources: [
        "CampusConnect AI database context",
        "CampusConnect AI workflow rules",
        "Gemini API",
      ],
    };
  } catch (error) {
    console.error("AI SERVICE ERROR:", error);

    return {
      answer:
        "AI service error: " +
        (error?.message ||
          "Gemini did not respond. Please check GEMINI_API_KEY, GEMINI_MODEL, and Render logs."),
      sources: [],
    };
  }
};