import { Draggable } from "@hello-pangea/dnd";

export default function TaskCard({ task, index, onDelete }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ffadad";
      case "Medium":
        return "#ffd6a5";
      case "Low":
        return "#caffbf";
      default:
        return "#e0e0e0";
    }
  };
  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Bug":
        return "red";
      case "Feature":
        return "blue";
      case "Enhancement":
        return "green";
      default:
        return "grey";
    }
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
          <div style={{ display: "flex", alignItems: "center" }}>
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
        </div>
      )}
    </Draggable>
  );
}
