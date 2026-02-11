import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { socket } from "../socket";
import EditTaskModal from "./EditTaskModal";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  // TODO: Implement state and WebSocket logic
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Feature");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    socket.emit("task:load");
    socket.on("tasks:initial", (loadedTasks) => setTasks(loadedTasks));
    socket.on("task:created", (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });
    socket.on("task:updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      );
    });
    socket.on("task:moved", (movedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === movedTask._id ? movedTask : t)),
      );
    });
    socket.on("task:deleted", (deletedId) => {
      setTasks((prev) => prev.filter((t) => t._id !== deletedId));
    });

    return () => {
      socket.off("tasks:initial");
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:moved");
      socket.off("task:deleted");
    };
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    socket.emit("task:create", {
      title: newTaskTitle,
      category: category,
      status: "Todo",
      priority: priority,
    });

    setNewTaskTitle("");
    setCategory("Feature");
    setPriority("Medium");
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    socket.emit("task:delete", taskId);
  };
  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  const handleSaveEdit = (taskData) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskData._id ? taskData : t)),
    );
    socket.emit("task:update", taskData);
    setEditingTask(null);
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

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task,
      ),
    );

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
          {["Todo", "In Progress", "Done"].map((status) => (
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
                      key={task._id || task.id}
                      task={task}
                      index={index}
                      onDelete={() => handleDeleteTask(task._id)}
                      onUpdate={() => handleEditClick(task)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveEdit}
        ></EditTaskModal>
      )}
    </div>
  );
}
