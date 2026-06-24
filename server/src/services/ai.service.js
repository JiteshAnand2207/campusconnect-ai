import Event from "../models/event.model.js";
import Problem from "../models/problem.model.js";
import { getGeminiClient } from "../config/gemini.js";

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
      .limit(12)
      .lean(),

    Problem.find({})
      .select("title category location status priority description createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
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
Ends: ${formatDate(event.endDate)}
Status: ${event.status || "N/A"}
Department: ${event.department || "All"}
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
Status: ${problem.status || "N/A"}
Description: ${problem.description || "N/A"}`;
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
You are CampusConnect AI, the built-in assistant for a college event management and campus problem reporting website.

Current user:
Name: ${user?.name || "Unknown"}
Email: ${user?.email || "Unknown"}
Role: ${user?.role || "guest"}
Department: ${user?.department || "Unknown"}
Year: ${user?.year || "Unknown"}

Platform features:
1. Students can browse approved events.
2. Students can register for approved events.
3. Students can see QR tickets in Dashboard > My Tickets.
4. Organizers can create events.
5. Admins approve or reject events.
6. Organizers and admins can verify student ticket codes.
7. Students can report campus problems.
8. Admins and moderators can manage problem reports.
9. Notifications inform users about registrations, approvals, rejections, and ticket verification.
10. The app has dashboards based on role: student, organizer, admin, moderator.

Important routes:
- Events page: /events
- Student tickets: /dashboard/tickets
- Create event: /dashboard/events/create
- Verify ticket: /dashboard/verify-ticket
- Problems page: /problems
- Create problem: /dashboard/problems/create
- Admin approval page: /dashboard/admin/events
- AI assistant page: /dashboard/ai

Current events from database:
${eventContext}

Current problems from database:
${problemContext}

Rules:
- Answer in a helpful, simple, student-friendly way.
- If the user asks how to use the website, give step-by-step instructions.
- If the user asks about current events, use the event context above.
- If the user asks about current problems, use the problem context above.
- Do not invent event names, ticket codes, users, registrations, or database records.
- If information is not available, say that it is not available in the current database context.
- Keep answers concise unless the user asks for detail.

User question:
${question}
`;
};

export const askCampusAI = async ({ question, user }) => {
  const ai = getGeminiClient();

  const { eventContext, problemContext } = await getCampusContext();

  const prompt = buildPrompt({
    question,
    user,
    eventContext,
    problemContext,
  });

  const interaction = await ai.interactions.create({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    input: prompt,
  });

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
};