import { useEffect, useState, useRef } from "react";
import { Trash2, Download, Upload } from "lucide-react";
import { Pencil } from "lucide-react";
import { Eye } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const TABS = ["All", "Images", "Videos"];
  const [activeTab, setActiveTab] = useState("All");
  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image' or 'video'
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState(null);

  // Fetch files from API
  const fetchFiles = async () => {
    const res = await fetch("/api/list");
    const data = await res.json();
    setFiles(data.files || []);

    // Fetch signed URLs for image and video files
    const urls = {};
    await Promise.all(
      (data.files || []).map(async (file) => {
        if (
          file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
          file.key.match(/\.(mp4|mov|avi|wmv|webm|mkv)$/i)
        ) {
          const res = await fetch(
            `/api/download?key=${encodeURIComponent(file.key)}`
          );
          const { url } = await res.json();
          urls[file.key] = url;
        }
      })
    );
    setImageUrls(urls);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      alert("File size exceeds 200MB limit.");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileContent: base64,
        }),
      });

      await fetchFiles();
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle delete
  const handleDelete = async (key) => {
    await fetch(`/api/delete?key=${key}`, { method: "DELETE" });
    await fetchFiles();
  };

  // Handle download
  const handleDownload = async (key) => {
    const res = await fetch(`/api/download?key=${encodeURIComponent(key)}`);
    const { url } = await res.json();
    // Download file as blob to avoid opening a new tab
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = key.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  const fileInputRef = useRef();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200 p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight drop-shadow-lg">
            ✨ S3 Premium Gallery
          </h1>

          <div className="flex gap-4 items-center">
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpload}
              disabled={loading}
            />
            <button
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-600 disabled:bg-gray-400 transition"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              <Upload className="h-5 w-5" />
              {loading ? "Uploading..." : "Upload Media"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center items-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 rounded-full font-semibold text-lg shadow transition border-2 border-indigo-200 hover:border-indigo-400 focus:outline-none ${
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-500"
                  : "bg-white text-indigo-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          {/* Filters Dropdown */}
          <div className="relative ml-4">
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-indigo-100 text-indigo-700 font-semibold shadow hover:from-gray-200 hover:to-indigo-200 border border-indigo-200"
              onClick={() => setFilterOpen((open) => !open)}
            >
              Filters <ChevronDown className="h-5 w-5" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-10 p-4 flex flex-col gap-2">
                <div className="font-bold text-indigo-700 mb-2">Sort By</div>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black ${
                    filterType === "size-asc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("size-asc")}
                >
                  Size: Small to Large
                </button>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black  ${
                    filterType === "size-desc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("size-desc")}
                >
                  Size: Large to Small
                </button>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black  ${
                    filterType === "date-asc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("date-asc")}
                >
                  Date: Recent to Old
                </button>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black  ${
                    filterType === "date-desc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("date-desc")}
                >
                  Date: Old to Recent
                </button>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black  ${
                    filterType === "text-asc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("text-asc")}
                >
                  Text: A-Z
                </button>
                <button
                  className={`text-left px-3 py-2 rounded hover:bg-indigo-50 text-black  ${
                    filterType === "text-desc" ? "bg-indigo-100" : ""
                  }`}
                  onClick={() => setFilterType("text-desc")}
                >
                  Text: Z-A
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <img
              src="/file.svg"
              alt="No files"
              className="w-24 mb-6 opacity-60"
            />
            <p className="text-lg text-gray-400 font-medium">
              No files uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {files
              .filter((file) => {
                if (activeTab === "All") return true;
                if (activeTab === "Images")
                  return file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                if (activeTab === "Videos")
                  return file.key.match(/\.(mp4|mov|avi|wmv|webm|mkv)$/i);
                return true;
              })
              .sort((a, b) => {
                if (!filterType) return 0;
                if (filterType === "size-asc")
                  return (a.size || 0) - (b.size || 0);
                if (filterType === "size-desc")
                  return (b.size || 0) - (a.size || 0);
                if (filterType === "date-asc")
                  return new Date(b.lastModified) - new Date(a.lastModified);
                if (filterType === "date-desc")
                  return new Date(a.lastModified) - new Date(b.lastModified);
                if (filterType === "text-asc")
                  return a.key.localeCompare(b.key);
                if (filterType === "text-desc")
                  return b.key.localeCompare(a.key);
                return 0;
              })
              .map((file) => (
                <div
                  key={file.key}
                  className="bg-white shadow-xl hover:shadow-2xl transition rounded-3xl overflow-hidden border border-gray-100"
                >
                  <div className="p-4 flex flex-col gap-2">
                    {/* Media Preview */}
                    <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center overflow-hidden relative">
                      {file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        imageUrls[file.key] ? (
                          <img
                            src={imageUrls[file.key]}
                            alt={file.key}
                            className="w-full h-full object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="text-gray-400">Loading...</div>
                        )
                      ) : file.key.match(/\.(mp4|mov|avi|wmv|webm|mkv)$/i) ? (
                        imageUrls[file.key] ? (
                          <video
                            src={imageUrls[file.key]}
                            controls={false}
                            className="w-full h-full object-cover rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="text-gray-400">Loading...</div>
                        )
                      ) : (
                        <div className="text-gray-400 text-3xl">📄</div>
                      )}
                      {/* Preview Eye Icon */}
                      {(file.key.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
                        imageUrls[file.key]) ||
                      (file.key.match(/\.(mp4|mov|avi|wmv|webm|mkv)$/i) &&
                        imageUrls[file.key]) ? (
                        <button
                          className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-indigo-100 transition"
                          onClick={() => {
                            setPreviewUrl(imageUrls[file.key]);
                            setPreviewType(
                              file.key.match(/\.(mp4|mov|avi|wmv|webm|mkv)$/i)
                                ? "video"
                                : "image"
                            );
                            setPreviewOpen(true);
                          }}
                          title="Preview"
                        >
                          <Eye className="h-5 w-5 text-indigo-600" />
                        </button>
                      ) : null}
                    </div>

                    {/* File Name */}
                    {editingKey === file.key ? (
                      <form
                        className="mt-2 flex gap-2 items-center"
                        onSubmit={(e) => {
                          e.preventDefault();
                          // Here you can send to backend to persist title
                          setEditingKey(null);
                        }}
                      >
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="border rounded px-2 py-1 text-base font-semibold text-gray-700 w-full"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 rounded bg-indigo-500 text-white font-semibold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                          onClick={() => setEditingKey(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <p className="mt-2 text-base font-semibold text-gray-700 truncate">
                        {file.key}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-2 items-center">
                      <button
                        onClick={() => handleDownload(file.key)}
                        className="flex items-center justify-center px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>

                      {editingKey === file.key ? (
                        <form
                          className="flex-1 flex gap-2 items-center"
                          onSubmit={(e) => {
                            e.preventDefault();
                            // Here you can send to backend to persist title
                            setEditingKey(null);
                          }}
                        >
                          <textarea
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            rows={3}
                            className="border rounded px-2 py-1 text-base font-semibold text-gray-700 w-full resize-vertical min-h-[60px]"
                          />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded bg-indigo-500 text-white font-semibold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                            onClick={() => setEditingKey(null)}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingKey(file.key);
                            setEditingTitle(file.key);
                            setEditDialogOpen(true);
                          }}
                          className="px-3 py-1.5 text-sm rounded-lg bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition"
                          title="Edit Title"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(file.key)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Preview Modal */}
        {/* Edit Dialog Modal */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          className="fixed z-50 inset-0 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-lg mx-auto flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditDialogOpen(false)}
              title="Close"
            >
              ×
            </button>
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/edit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    oldKey: editingKey,
                    newKey: editingTitle,
                  }),
                });
                if (res.ok) {
                  setEditDialogOpen(false);
                  setEditingKey(null);
                  await fetchFiles();
                } else {
                  alert("Failed to rename file.");
                }
              }}
            >
              <label className="font-semibold text-lg text-indigo-700">
                Edit Title/Description
              </label>
              <textarea
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                rows={6}
                className="border rounded px-3 py-2 text-base font-semibold text-gray-700 w-full resize-vertical min-h-[120px]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-500 text-white font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Dialog>
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          className="fixed z-50 inset-0 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xl mx-auto flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setPreviewOpen(false)}
              title="Close"
            >
              ×
            </button>
            {previewUrl && previewType === "video" ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="max-h-[60vh] rounded-xl mb-4 shadow"
              />
            ) : previewUrl && previewType === "image" ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[60vh] rounded-xl mb-4 shadow"
              />
            ) : null}
          </div>
        </Dialog>
      </div>
    </div>
  );
}
