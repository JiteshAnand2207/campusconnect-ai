import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const BACKEND_URL = "http://localhost:5000";

const EventCard = ({ event }) => {
  const getFileUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
  };

  const startDate = event.startDate
    ? new Date(event.startDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date not available";

  const seatsLeft =
    Number(event.capacity || 0) - Number(event.registeredCount || 0);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {event.bannerImage && (
        <img
          src={getFileUrl(event.bannerImage)}
          alt={event.title}
          className="h-48 w-full object-cover"
        />
      )}

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase text-indigo-600">
            {event.category || "event"}
          </span>

          {event.status && <StatusBadge status={event.status} />}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-950">
          {event.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {event.description}
        </p>

        <div className="mt-5 grid gap-2 text-sm text-slate-600">
          <p>
            <span className="font-semibold text-slate-800">Venue:</span>{" "}
            {event.venue}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Date:</span>{" "}
            {startDate}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Department:</span>{" "}
            {event.department || "All"}
          </p>

          <p>
            <span className="font-semibold text-slate-800">Seats:</span>{" "}
            {event.registeredCount || 0}/{event.capacity || 0} registered
          </p>

          {seatsLeft >= 0 && (
            <p>
              <span className="font-semibold text-slate-800">Seats left:</span>{" "}
              {seatsLeft}
            </p>
          )}
        </div>

        {event.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/events/${event._id}`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            View details
          </Link>

          {event.brochureUrl && (
            <a
              href={getFileUrl(event.brochureUrl)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View brochure
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;