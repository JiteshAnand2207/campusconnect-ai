import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelRegistration,
  getMyRegistrations,
} from "../../api/registrationApi";

const DashboardTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyRegistrations();
      setRegistrations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCancel = async (registrationId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this registration?"
    );

    if (!confirmCancel) return;

    try {
      setActionLoading(registrationId);
      setError("");

      await cancelRegistration(registrationId);
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel registration");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Student tickets
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            My Tickets
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            All your event registrations and ticket codes will appear here.
            Show the ticket code at entry for verification.
          </p>

          <Link
            to="/events"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Events
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-center font-semibold text-slate-600">
            Loading tickets...
          </p>
        ) : registrations.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              No tickets yet
            </h2>

            <p className="mt-2 text-slate-600">
              Register for an approved event and your ticket will appear here.
            </p>

            <Link
              to="/events"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {registrations.map((registration) => {
              const event = registration.event;

              return (
                <article
                  key={registration._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="bg-slate-950 p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                      CampusConnect AI Ticket
                    </p>

                    <h2 className="mt-3 text-2xl font-extrabold">
                      {event?.title || "Event"}
                    </h2>

                    <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase">
                      {registration.status}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-4">
                      <Info label="Category" value={event?.category || "N/A"} />
                      <Info label="Venue" value={event?.venue || "N/A"} />
                      <Info
                        label="Starts"
                        value={formatDate(event?.startDate)}
                      />
                      <Info label="Ends" value={formatDate(event?.endDate)} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-5 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                        Ticket Code
                      </p>

                      <p className="mt-3 break-all font-mono text-2xl font-black text-slate-950">
                        {registration.ticketCode}
                      </p>

                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        Organizer or admin can verify this code from ticket
                        verification.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/events/${event?._id}`}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        View Event
                      </Link>

                      {registration.status === "registered" && (
                        <button
                          type="button"
                          disabled={actionLoading === registration._id}
                          onClick={() => handleCancel(registration._id)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionLoading === registration._id
                            ? "Cancelling..."
                            : "Cancel Ticket"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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

export default DashboardTickets;