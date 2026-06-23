import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProblem } from "../../api/problemApi";
import FileUploader from "../../components/common/FileUploader";

const categories = [
  "hostel",
  "mess",
  "academic",
  "transport",
  "technical",
  "lost_found",
  "event",
  "campus",
  "other",
];

const CreateProblem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "campus",
    visibility: "public",
    tags: "",
    attachments: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
          attachments: formData.attachments,
      };

      await createProblem(payload);
      navigate("/dashboard/problems");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
        Campus helpdesk
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Report a campus problem
      </h1>

      <p className="mt-3 text-slate-600">
        Create a public problem for community help or a private problem for
        admin/moderator attention.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <FormInput
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="WiFi not working in library"
        />

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            placeholder="Explain the problem clearly..."
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="public">Public - community can help</option>
              <option value="private">Private - only admin/moderator</option>
            </select>
          </div>
        </div>

        <FormInput
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="wifi, library, network"
        />
        <FileUploader
  label="Problem attachment image or PDF"
  accept="image/*,application/pdf"
  currentUrl={formData.attachments[0]}
  onUploaded={(file) =>
    setFormData((prev) => ({
      ...prev,
      attachments: [file.url],
    }))
  }
/>
        <button
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Submitting problem..." : "Submit Problem"}
        </button>
      </form>
    </div>
  );
};

const FormInput = ({ label, ...props }) => {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
      />
    </div>
  );
};

export default CreateProblem;