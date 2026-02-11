import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import { socket } from "../../socket";

// This allows us to spy on 'socket.emit' to see if it was called
vi.mock("../../socket", () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

describe("WebSocket Integration", () => {
  it("emits a socket event when a task is created", () => {
    // Render the board
    render(<KanbanBoard tasks={[]} />);

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
        priority: "Medium", // Default
        category: "Feature", // Default
      }),
    );
  });
});
