import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent as createEventApi } from "../../api/eventApi";
import FileUploader from "../../components/common/FileUploader";

const categories = [
  "technical",
  "cultural",
  "sports",
  "workshop",
  "seminar",
  "hackathon",
  "club",
  "other",
];

const CreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "technical",
    department: "All",
    venue: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    capacity: "",
    tags: "",
    bannerImage: "",
    brochureUrl: "",
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
        title: formData.title,
        description: formData.description,
        category: formData.category,
        department: formData.department,
        venue: formData.venue,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationDeadline: formData.registrationDeadline || undefined,
        capacity: Number(formData.capacity),
        bannerImage: formData.bannerImage,
        brochureUrl: formData.brochureUrl,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await createEventApi(payload);

      navigate("/dashboard/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
        Organizer
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-950">
        Create a new event
      </h1>

      <p className="mt-3 text-slate-600">
        Submit an event for admin approval. Once approved, students will be able
        to view and register for it.
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <FormInput
          label="Event title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="AI Workshop 2026"
          required
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
            placeholder="Explain what this event is about..."
            required
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
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
                  {category}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="All / CSE / ECE / IIoT"
          />
        </div>

        <FormInput
          label="Venue"
          name="venue"
          value={formData.venue}
          onChange={handleChange}
          placeholder="Seminar Hall"
          required
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FormInput
            label="Start date and time"
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <FormInput
            label="End date and time"
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormInput
            label="Registration deadline"
            type="datetime-local"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
          />

          <FormInput
            label="Capacity"
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="100"
            min="1"
            required
          />
        </div>

        <FormInput
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="ai, workshop, coding"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <FileUploader
            label="Event banner image"
            accept="image/*"
            currentUrl={formData.bannerImage}
            onUploaded={(file) =>
              setFormData((prev) => ({
                ...prev,
                bannerImage: file.url,
              }))
            }
          />

          <FileUploader
            label="Event brochure PDF or image"
            accept="image/*,application/pdf"
            currentUrl={formData.brochureUrl}
            onUploaded={(file) =>
              setFormData((prev) => ({
                ...prev,
                brochureUrl: file.url,
              }))
            }
          />
        </div>

        <button
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating event..." : "Create Event"}
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

export default CreateEvent;