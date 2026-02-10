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
      <div className="add-task-bar" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          style={{ padding: "8px", flex: 1 }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="Feature">Feature</option>
          <option value="Bug">Bug</option>
          <option value="Enhancement">Enhancement</option>
        </select>
        <button onClick={handleAddTask}>Add Task</button>
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
                    // REFACTORED: Use the new component
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onDelete={handleDeleteTask}
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
