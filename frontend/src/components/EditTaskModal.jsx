import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function EditTaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [category, setCategory] = useState(task.category || "Feature");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let finalFileUrl = task.fileUrl || "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        finalFileUrl = data.fileUrl;
      } catch (error) {
        console.error("Upload error:", error);
        alert("File upload failed. Please try again.");
        setUploading(false);
        return;
      }
    }
    onSave({
      ...task,
      _id: task._id || task.id,
      title,
      priority,
      category,
      fileUrl: finalFileUrl,
    });
    setUploading(false);
  };

  return (
    <div
      data-testid="edit-modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        data-testid="edit-modal-content"
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "400px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Edit Task</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            value={title}
            data-testid="edit-title-input"
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            placeholder="Task Title"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}
            >
              Attachment:
            </label>
            <input
              type="file"
              data-testid="file-input"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert(
                      "File is too large! Please upload a file smaller than 5MB.",
                    );
                    e.target.value = "";
                    return;
                  }
                  setSelectedFile(file);
                }
              }}
              style={{ fontSize: "14px" }}
            />
            {task.fileUrl && !selectedFile && (
              <div
                style={{ fontSize: "12px", color: "green", marginTop: "2px" }}
              >
                Current File:{" "}
                <a
                  href={task.fileUrl}
                  data-testid="current-file-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </div>
            )}
          </div>

          <select
            value={priority}
            data-testid="edit-priority-select"
            onChange={(e) => setPriority(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={category}
            data-testid="edit-category-select"
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            <option value="Feature">Feature</option>
            <option value="Bug">Bug</option>
            <option value="Enhancement">Enhancement</option>
          </select>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="submit"
              data-testid="save-edit-btn"
              disabled={uploading}
              style={{
                padding: "8px 16px",
                backgroundColor: uploading ? "#93c5fd" : "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: uploading ? "not-allowed" : "pointer",
                flex: 1,
              }}
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              data-testid="cancel-edit-btn"
              disabled={uploading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
