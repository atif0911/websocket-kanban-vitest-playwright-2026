// import { render, screen } from "@testing-library/react";

// import KanbanBoard from "../../components/KanbanBoard";

// // mock socket.io-client library

// test("WebSocket receives task update", async () => {
//   render(<KanbanBoard />);

//   expect(screen.getByText("Kanban Board")).toBeInTheDocument();
// });

// // TODO: Add more integration tests

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import { socket } from "../../socket";

// 1. Mock the socket module
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

    // 2. Find elements
    const input = screen.getByPlaceholderText(/Enter task title/i);
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    // 3. Simulate User Typing "New Integration Task"
    fireEvent.change(input, { target: { value: "New Integration Task" } });

    // 4. Simulate Click
    fireEvent.click(addButton);

    // 5. THE TEST: Did we tell the server?
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
