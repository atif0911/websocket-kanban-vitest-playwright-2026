import { Draggable } from "@hello-pangea/dnd";
import { getPriorityColor, getCategoryColor } from "../utils";

export default function TaskCard({ task, index, onDelete, onUpdate }) {
  const isImage = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
  };

  return (
    <Draggable draggableId={task._id || task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: "none",
            padding: "16px",
            margin: "0 0 8px 0",
            minHeight: "50px",
            backgroundColor: snapshot.isDragging ? "#e0e7ff" : "white", // Highlight on drag
            color: "#334155",
            borderRadius: "8px",
            boxShadow:
              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
            ...provided.draggableProps.style,
          }}
        >
          {/* --- 1. TASK HEADER (Title & Priority) --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  task.priority === "High"
                    ? "#fee2e2"
                    : task.priority === "Medium"
                      ? "#fef3c7"
                      : "#dcfce7",
                color:
                  task.priority === "High"
                    ? "#991b1b"
                    : task.priority === "Medium"
                      ? "#92400e"
                      : "#166534",
              }}
            >
              {task.priority}
            </span>

            {/* Edit/Delete Actions */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onUpdate}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: "14px",
                }}
                title="Edit Task"
              >
                ✏️
              </button>
              <button
                onClick={onDelete}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  fontSize: "14px",
                }}
                title="Delete Task"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* --- 2. TASK TITLE --- */}
          <div style={{ fontWeight: "500", marginBottom: "10px" }}>
            {task.title}
          </div>

          {/* --- 3. IMAGE / FILE ATTACHMENT (The Fix) --- */}
          {task.fileUrl && (
            <div
              style={{
                marginBottom: "12px",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {isImage(task.fileUrl) ? (
                // If it's an image, show it
                <img
                  src={task.fileUrl}
                  alt="Task attachment"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "200px",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }} // Hide if link breaks
                />
              ) : (
                // If it's a PDF/Doc, show a link
                <a
                  href={task.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "12px",
                    color: "#4f46e5",
                    textDecoration: "underline",
                  }}
                >
                  📎 View Attachment
                </a>
              )}
            </div>
          )}

          {/* --- 4. CATEGORY FOOTER --- */}
          <div
            style={{ fontSize: "12px", color: "#64748b", marginTop: "auto" }}
          >
            {task.category || "Feature"}
          </div>
        </div>
      )}
    </Draggable>
  );
}
