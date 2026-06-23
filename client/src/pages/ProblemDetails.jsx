import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProblemById, toggleProblemUpvote } from "../api/problemApi";
import {
  acceptSolution,
  createSolution,
  getSolutionsForProblem,
  toggleSolutionUpvote,
} from "../api/solutionApi";
import ProblemStatusBadge from "../components/problem/ProblemStatusBadge";
import VisibilityBadge from "../components/problem/VisibilityBadge";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProblemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [solutionText, setSolutionText] = useState("");

  const [loading, setLoading] = useState(true);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [error, setError] = useState("");
  const [solutionError, setSolutionError] = useState("");

  const getFullFileUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  };

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProblemById(id);
      setProblem(response.data);

      if (response.data.visibility === "public") {
        const solutionResponse = await getSolutionsForProblem(id);
        setSolutions(solutionResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleProblemUpvote = async () => {
    try {
      await toggleProblemUpvote(id);
      fetchProblem();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upvote problem");
    }
  };

  const handlePostSolution = async (e) => {
    e.preventDefault();

    try {
      setSolutionLoading(true);
      setSolutionError("");

      await createSolution(id, {
        description: solutionText,
      });

      setSolutionText("");
      fetchProblem();
    } catch (err) {
      setSolutionError(err.response?.data?.message || "Failed to post solution");
    } finally {
      setSolutionLoading(false);
    }
  };

  const handleAcceptSolution = async (solutionId) => {
    try {
      await acceptSolution(solutionId);
      fetchProblem();
    } catch (err) {
      setSolutionError(
        err.response?.data?.message || "Failed to accept solution"
      );
    }
  };

  const handleSolutionUpvote = async (solutionId) => {
    try {
      await toggleSolutionUpvote(solutionId);
      fetchProblem();
    } catch (err) {
      setSolutionError(
        err.response?.data?.message || "Failed to upvote solution"
      );
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50">
        <p className="font-semibold text-slate-600">Loading problem...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="font-semibold text-red-600">{error}</p>

          <Link
            to="/problems"
            className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to problems
          </Link>
        </section>
      </main>
    );
  }

  const isOwner = problem.postedBy?._id === user?._id;
  const canModerate = user?.role === "admin" || user?.role === "moderator";
  const canAcceptSolution = isOwner || canModerate;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <Link to="/problems" className="text-sm font-semibold text-indigo-600">
          ← Back to problems
        </Link>

        <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
              {problem.category?.replace("_", " ")}
            </span>

            <ProblemStatusBadge status={problem.status} />
            <VisibilityBadge visibility={problem.visibility} />
          </div>

          <h1 className="mt-5 text-4xl font-extrabold text-slate-950">
            {problem.title}
          </h1>

          <p className="mt-5 leading-8 text-slate-600">
            {problem.description}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Info label="Posted by" value={problem.postedBy?.name} />
            <Info label="Department" value={problem.postedBy?.department} />
            <Info label="Upvotes" value={problem.upvotes?.length || 0} />
          </div>

          {problem.visibility === "public" && (
            <button
              onClick={handleProblemUpvote}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Upvote Problem
            </button>
          )}

          {problem.tags?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-slate-950">Tags</h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {problem.attachments?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-bold text-slate-950">Attachments</h2>

              <div className="mt-3 flex flex-wrap gap-3">
                {problem.attachments.map((attachment, index) => (
                  <a
                    key={`${attachment}-${index}`}
                    href={getFullFileUrl(attachment)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    View attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>

        {problem.visibility === "private" && (
          <div className="mt-6 rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Private problem
            </h2>

            <p className="mt-3 text-slate-600">
              This problem is private. Only the owner, admin, or moderator can
              view it. Community solutions are disabled for private problems.
            </p>
          </div>
        )}

        {problem.visibility === "public" && (
          <>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">
                Post a solution
              </h2>

              {solutionError && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                  {solutionError}
                </div>
              )}

              <form onSubmit={handlePostSolution} className="mt-5 space-y-4">
                <textarea
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows="5"
                  placeholder="Write your solution..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
                />

                <button
                  disabled={solutionLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {solutionLoading ? "Posting..." : "Post Solution"}
                </button>
              </form>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-950">
                Community solutions
              </h2>

              {solutions.length === 0 && (
                <p className="mt-4 text-slate-600">
                  No solutions yet. Be the first to help.
                </p>
              )}

              <div className="mt-5 space-y-4">
                {solutions.map((solution) => (
                  <div
                    key={solution._id}
                    className={`rounded-2xl border p-5 ${
                      solution.isAccepted
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {solution.postedBy?.name}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {solution.postedBy?.role}
                        </p>
                      </div>

                      {solution.isAccepted && (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase text-white">
                          Accepted
                        </span>
                      )}
                    </div>

                    <p className="mt-4 leading-7 text-slate-700">
                      {solution.description}
                    </p>

                    {solution.attachments?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {solution.attachments.map((attachment, index) => (
                          <a
                            key={`${attachment}-${index}`}
                            href={getFullFileUrl(attachment)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Solution attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleSolutionUpvote(solution._id)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                      >
                        Upvote ({solution.upvotes?.length || 0})
                      </button>

                      {canAcceptSolution && !solution.isAccepted && (
                        <button
                          onClick={() => handleAcceptSolution(solution._id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Accept Solution
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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

      <p className="mt-2 font-semibold text-slate-950">{value || "N/A"}</p>
    </div>
  );
};

export default ProblemDetails;