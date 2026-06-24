import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EventCard from "../components/event/EventCard";
import { getEvents } from "../api/eventApi";
import { useAuth } from "../context/AuthContext";

const categories = [
  "",
  "technical",
  "cultural",
  "sports",
  "workshop",
  "seminar",
  "hackathon",
  "club",
  "other",
];

const Events = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreateEvent = user?.role === "organizer" || user?.role === "admin";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEvents({
        search: filters.search || undefined,
        category: filters.category || undefined,
      });

      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Discover events
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">
                College events
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Browse approved college events, workshops, hackathons, club
                events, sports activities, and seminars.
              </p>
            </div>

            {canCreateEvent && (
              <Link to="/dashboard/events/create" className="cc-create-event-btn">
                + Create Event
              </Link>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-[1fr_220px_auto]"
          >
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search events..."
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            >
              {categories.map((category) => (
                <option key={category || "all"} value={category}>
                  {category ? category : "All categories"}
                </option>
              ))}
            </select>

            <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">
              Search
            </button>
          </form>
        </div>

        {loading && (
          <p className="mt-8 text-center font-semibold text-slate-600">
            Loading events...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              No events found
            </h2>
            <p className="mt-2 text-slate-600">
              Approved events will appear here after admin approval.
            </p>

            {canCreateEvent && (
              <Link
                to="/dashboard/events/create"
                className="cc-create-event-btn mx-auto"
              >
                Create first event
              </Link>
            )}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Events;