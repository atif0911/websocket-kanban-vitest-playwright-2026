import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import { socket } from "../../socket";

vi.mock("../../socket", () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

vi.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) =>
    children(
      {
        draggableProps: {},
        innerRef: vi.fn(),
        placeholder: null,
      },
      {},
    ),
  Draggable: ({ children }) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: vi.fn(),
      },
      {},
    ),
}));

describe("WebSocket Integration", () => {
  it("emits a socket event when a task is created", () => {
    // Render the board (no props needed since state is internal)
    render(<KanbanBoard />);

    // Find elements
    const input = screen.getByPlaceholderText(/Enter task title/i);
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    // Simulate User Typing "New Integration Task"
    fireEvent.change(input, { target: { value: "New Integration Task" } });

    // Simulate Click
    fireEvent.click(addButton);

    // THE TEST
    expect(socket.emit).toHaveBeenCalledWith(
      "task:create",
      expect.objectContaining({
        title: "New Integration Task",
        priority: "Medium", // Default state
        category: "Feature", // Default state
        status: "Todo", // Explicitly sent by handleAddTask
      }),
    );
  });
});
