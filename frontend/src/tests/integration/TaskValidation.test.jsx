import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import { socket } from "../../socket";

vi.mock("../../socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe("Task Validation Logic", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  // TEST 1: The "Empty Spam" Protection
  it("does NOT create a task if the title is empty or just spaces", () => {
    render(<KanbanBoard tasks={[]} />);

    const input = screen.getByPlaceholderText(/Enter task title/i);
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    // User types spaces
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    // Verify: Socket should remain silent
    expect(socket.emit).not.toHaveBeenCalled();
  });

  // TEST 2: The "Massive File" Protection
  it("alerts the user if they try to upload a file larger than 1MB", async () => {
    // Mock window.alert so it doesn't actually pop up during the test
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    // Render board with ONE task (so the card exists to upload to)
    const mockTasks = [
      { id: "1", title: "Test Task", status: "todo", priority: "Medium" },
    ];
    const { container } = render(<KanbanBoard tasks={mockTasks} />);

    // Create a fake file that is 2MB
    // 2 * 1024 * 1024 bytes
    const largeFile = new File(
      ["a".repeat(2 * 1024 * 1024)],
      "huge_image.png",
      { type: "image/png" },
    );

    // Find the hidden file input
    const fileInput = container.querySelector('input[type="file"]');

    // Simulate user selecting the file
    await fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Verify: Alert was shown
    expect(alertMock).toHaveBeenCalledWith(
      expect.stringContaining("too large"),
    );

    // Verify: Socket did NOT try to send that massive file
    expect(socket.emit).not.toHaveBeenCalledWith(
      "task:update",
      expect.anything(),
    );

    // Cleanup
    alertMock.mockRestore();
  });
});
