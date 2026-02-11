import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { socket } from "../socket";
import TaskCard from "./TaskCard";

export default function KanbanBoard({ tasks = [] }) {
  // TODO: Implement state and WebSocket logic
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Feature");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    socket.emit("task:create", {
      title: newTaskTitle,
      category: category,

      priority: priority,
    });

    setNewTaskTitle("");
    setCategory("Feature");
    setPriority("Medium");
  };

  const handleDeleteTask = (taskId) => {
    socket.emit("task:delete", taskId);
  };
  const handleUpdateTask = (updatedTask) => {
    socket.emit("task:update", updatedTask);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    //if dropped outside a valid position do nothing
    if (!destination) return;

    //dropped in same place do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newStatus = destination.droppableId;

    socket.emit("task:move", {
      taskId: draggableId,
      newStatus: newStatus,
    });
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="kanban-board">
      <div
        className="add-task-bar"
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          marginBottom: "30px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            fontSize: "16px",
            outline: "none",
            color: "#334155",
          }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            backgroundColor: "white",
            color: "#475569",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            minWidth: "140px",
          }}
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            backgroundColor: "white",
            color: "#475569",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            minWidth: "130px",
          }}
        >
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="Enhancement">Enhancement</option>
        </select>
        <button
          onClick={handleAddTask}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4f46e5", // Indigo-600
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(79, 70, 229, 0.3)",
            transition: "transform 0.1s ease",
            minWidth: "120px",
          }}
        >
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="columns-container"
          style={{ display: "flex", gap: "20px" }}
        >
          {["todo", "inprogress", "done"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: 1,
                    background: "#f4f5f7",
                    padding: "10px",
                    borderRadius: "5px",
                    minHeight: "400px",
                  }}
                >
                  <h3 style={{ textTransform: "capitalize" }}>
                    {status === "inprogress" ? "In Progress" : status}
                  </h3>

                  {getTasksByStatus(status).map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onDelete={handleDeleteTask}
                      onUpdate={handleUpdateTask}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
