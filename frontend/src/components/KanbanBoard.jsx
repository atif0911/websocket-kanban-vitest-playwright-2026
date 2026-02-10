import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { socket } from "../socket";

export default function KanbanBoard({ tasks = [] }) {
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

      socket.emit('task:move', {
          taskId: draggableId,
          newStatus: newStatus
      })
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
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button onClick={handleAddTask} style={{ padding: "8px 16px" }}>
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
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="task-card"
                          style={{
                            background: "white",
                            padding: "10px",
                            margin: "10px 0",
                            borderRadius: "4px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            ...provided.draggableProps.style, // Vital for smooth movement
                          }}
                        >
                          {task.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {/* Placeholder keeps the column size when empty */}
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
