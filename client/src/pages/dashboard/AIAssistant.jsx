import { useState } from "react";
import { askCampusAI } from "../../api/aiApi";

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi, I am your CampusConnect AI assistant. Ask me about events, problems, QR tickets, dashboards, or how to use this platform.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const getAnswerText = (payload) => {
    return (
      payload?.data?.answer ||
      payload?.answer ||
      payload?.message ||
      "I am here to help you use CampusConnect AI."
    );
  };

  const handleAsk = async (event) => {
    event.preventDefault();

    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    setMessages((prev) => [...prev, { from: "user", text: cleanQuestion }]);
    setQuestion("");

    try {
      setLoading(true);

      const payload = await askCampusAI(cleanQuestion);

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: getAnswerText(payload) },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text:
            error?.response?.data?.message ||
            "AI assistant is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What events are available right now?",
    "How do I register for an event?",
    "Where can I see my QR ticket?",
    "How can an organizer verify tickets?",
    "How can I report a campus problem?",
    "Explain this website quickly.",
  ];

  return (
    <main className="cc-ai-page">
      <section className="cc-ai-page-hero">
        <span>AI Assistant</span>
        <h1>Ask CampusConnect AI</h1>
        <p>
          Ask about events, problem reports, QR tickets, dashboards, approvals,
          and platform workflow.
        </p>
      </section>

      <section className="cc-ai-chat-shell">
        <div className="cc-ai-chat-window">
          {messages.map((message, index) => (
            <div
              key={`${message.from}-${index}`}
              className={
                message.from === "user"
                  ? "cc-ai-message user"
                  : "cc-ai-message ai"
              }
            >
              {message.text}
            </div>
          ))}

          {loading && <div className="cc-ai-message ai">Thinking...</div>}
        </div>

        <div className="cc-ai-suggestions">
          {suggestions.map((item) => (
            <button type="button" key={item} onClick={() => setQuestion(item)}>
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleAsk} className="cc-ai-page-form">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about CampusConnect AI..."
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AIAssistant;