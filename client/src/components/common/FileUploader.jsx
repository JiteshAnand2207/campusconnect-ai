import { useState } from "react";
import { uploadSingleFile } from "../../api/uploadApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FileUploader = ({ label, accept, onUploaded, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const response = await uploadSingleFile(file);
      onUploaded(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fullUrl = currentUrl?.startsWith("http")
    ? currentUrl
    : `${API_URL}${currentUrl}`;

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <input
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
      />

      {uploading && (
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Uploading...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>
      )}

      {currentUrl && (
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-sm font-semibold text-indigo-600"
        >
          View uploaded file
        </a>
      )}
    </div>
  );
};

export default FileUploader;