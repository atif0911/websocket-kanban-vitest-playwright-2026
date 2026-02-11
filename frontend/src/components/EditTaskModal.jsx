import { useState } from "react";

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
        const response = await fetch("http://localhost:5000/api/upload", {
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

  //
  return (
    <div
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
          {/* TITLE INPUT */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            placeholder="Task Title"
          />

          {/* FILE UPLOAD INPUT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}
            >
              Attachment:
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ fontSize: "14px" }}
            />
            {/* Show existing file link if it exists */}
            {task.fileUrl && !selectedFile && (
              <div
                style={{ fontSize: "12px", color: "green", marginTop: "2px" }}
              >
                Current File:{" "}
                <a
                  href={task.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </div>
            )}
          </div>

          {/* PRIORITY SELECT */}
          <select
            value={priority}
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

          {/* CATEGORY SELECT */}
          <select
            value={category}
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

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={uploading} // Prevent double clicks
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
