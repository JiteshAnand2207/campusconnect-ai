import { useState } from "react";
import { verifyTicket } from "../../api/registrationApi";

const VerifyTicket = () => {
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await verifyTicket(ticketCode);
      setResult(response.data);
      setTicketCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Ticket verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
        Check-in
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Verify event ticket
      </h1>

      <p className="mt-3 text-slate-600">
        Enter a student's ticket code to mark attendance.
      </p>

      <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4 md:flex-row">
        <input
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="CCAI-XXXXXXXXXXXX"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        />

        <button
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
          <h2 className="text-xl font-bold text-emerald-700">
            Ticket verified
          </h2>

          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Student:</span>{" "}
              {result.student?.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {result.student?.email}
            </p>
            <p>
              <span className="font-semibold">Event:</span>{" "}
              {result.event?.title}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {result.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyTicket;