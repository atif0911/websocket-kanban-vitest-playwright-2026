import { useState, useEffect } from "react";
import { socket } from "../socket";

export default function KanbanBoard({ tasks }) {
  // TODO: Implement state and WebSocket logic
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    socket.emit("task:create", {
      title: newTaskTitle,
      description: "",
      priority: "Medium", //default priority
    });

    setNewTaskTitle("");
  };

  const getTasksByStatus = (status) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="kanban-board">
      <div className="add-task-bar" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={handleAddTask} style={{ padding: "8px 16px" }}>
          Add Task
        </button>
      </div>

      <div
        className="columns-container"
        style={{ display: "flex", gap: "20px" }}
      >
        {/* TO DO */}
        <div
          className="column"
          style={{
            flex: 1,
            background: "#f4f5f7",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>To Do</h3>
          {getTasksByStatus("todo").map((task) => (
            <div
              key={task.id}
              className="task-card"
              style={{
                background: "white",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              {task.title}
            </div>
          ))}
        </div>

        {/* IN PROGRESS */}
        <div
          className="column"
          style={{
            flex: 1,
            background: "#e2e4e9",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>In Progress</h3>
          {getTasksByStatus("inprogress").map((task) => (
            <div
              key={task.id}
              className="task-card"
              style={{
                background: "white",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              {task.title}
            </div>
          ))}
        </div>

        {/* DONE */}
        <div
          className="column"
          style={{
            flex: 1,
            background: "#d3f9d8",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Done</h3>
          {getTasksByStatus("done").map((task) => (
            <div
              key={task.id}
              className="task-card"
              style={{
                background: "white",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
              }}
            >
              {task.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
