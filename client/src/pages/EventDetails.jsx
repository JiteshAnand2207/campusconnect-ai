import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEventById } from "../api/eventApi";
import StatusBadge from "../components/event/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { registerForEvent } from "../api/registrationApi";

const EventDetails = () => {
  const handleRegister = async () => {
  try {
    setRegisterLoading(true);
    setRegisterMessage("");

    if (!isAuthenticated) {
      setRegisterMessage("Please login as a student to register.");
      return;
    }

    if (user?.role !== "student") {
      setRegisterMessage("Only students can register for events.");
      return;
    }

    await registerForEvent(event._id);
    setRegisterMessage("Registered successfully. Your ticket is available in dashboard.");
    fetchEvent();
  } catch (err) {
    setRegisterMessage(err.response?.data?.message || "Registration failed");
  } finally {
    setRegisterLoading(false);
  }
};const { user, isAuthenticated } = useAuth();
const [registerLoading, setRegisterLoading] = useState(false);
const [registerMessage, setRegisterMessage] = useState("");
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEventById(id);
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50">
        <p className="font-semibold text-slate-600">Loading event...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>
          <Link
            to="/events"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to events
          </Link>
        </section>
      </main>
    );
  }

  const startDate = new Date(event.startDate).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const endDate = new Date(event.endDate).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-4xl">
        <Link to="/events" className="text-sm font-semibold text-indigo-600">
          ← Back to events
        </Link>

        <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase text-indigo-600">
              {event.category}
            </span>
            <StatusBadge status={event.status} />
          </div>

          <h1 className="mt-5 text-4xl font-extrabold text-slate-950">
            {event.title}
          </h1>

          <p className="mt-5 leading-8 text-slate-600">{event.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="Venue" value={event.venue} />
            <Info label="Department" value={event.department || "All"} />
            <Info label="Starts" value={startDate} />
            <Info label="Ends" value={endDate} />
            <Info
              label="Capacity"
              value={`${event.registeredCount}/${event.capacity}`}
            />
            <Info label="Created by" value={event.createdBy?.name || "N/A"} />
          </div>

          {event.tags?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-slate-950">Tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
  onClick={handleRegister}
  disabled={registerLoading || event.status !== "approved"}
  className="mt-8 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {registerLoading ? "Registering..." : "Register for event"}
</button>

{registerMessage && (
  <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
    {registerMessage}
  </div>
)}

          <p className="mt-3 text-sm text-slate-500">
            Registration will be connected in the QR ticket phase.
          </p>
        </article>
      </section>
    </main>
  );
};

const Info = ({ label, value }) => {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-950">{value}</p>
    </div>
  );
};

export default EventDetails;