import { Draggable } from "@hello-pangea/dnd";
import { getPriorityColor, getCategoryColor } from "../utils";

export default function TaskCard({ task, index, onDelete, onUpdate }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //limiting file size to one mb to prevent socket lag
    if (file.size > 1024 * 1024) {
      alert("File is too large! Please choose an image under 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;

      onUpdate({ ...task, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
          style={{
            background: "white",
            padding: "12px",
            margin: "10px 0",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            position: "relative", // Needed for the delete button positioning
            ...provided.draggableProps.style,
          }}
        >
          {/* image preview if exists */}
          {task.image && (
            <img
              src={task.image}
              alt="attachment"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            />
          )}
          {/* 1. Header: Title & Delete */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{task.title}</span>
            <button
              onClick={() => onDelete(task.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#ff6b6b",
                fontSize: "16px",
              }}
            >
              ✖
            </button>
          </div>
          <div
            style={{
              marginBottom: "8px",
              fontSize: "12px",
              color: getCategoryColor(task.category),
            }}
          >
            ● {task.category || "Feature"}
          </div>
          {/* 2. Footer: Priority Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  background: getPriorityColor(task.priority),
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {task.priority || "Medium"}
              </span>
            </div>
            {/* Right side: Upload Button */}
            <label
              style={{ cursor: "pointer", color: "#555" }}
              title="Attach Image"
            >
              {/* The hidden magic input */}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              {/* Image icon */}
              📎
            </label>
          </div>
        </div>
      )}
    </Draggable>
  );
}
