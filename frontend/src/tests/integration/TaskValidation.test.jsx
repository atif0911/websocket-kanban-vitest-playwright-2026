import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import EditTaskModal from "../../components/EditTaskModal"; // Import this!
import { socket } from "../../socket";

// --- 1. MOCK SOCKET ---
vi.mock("../../socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// --- 2. MOCK DRAG & DROP (Crucial!) ---
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

describe("Task Validation Logic", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: The "Empty Spam" Protection
  it("does NOT create a task if the title is empty or just spaces", () => {
    render(<KanbanBoard />); // No props needed

    const input = screen.getByPlaceholderText(/Enter task title/i);
    const addButton = screen.getByRole("button", { name: /Add Task/i });

    // User types spaces
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    // Verify: Specifically check that 'task:create' was NOT called.
    // (We ignore 'task:load' which happens on mount)
    expect(socket.emit).not.toHaveBeenCalledWith(
      "task:create",
      expect.anything(),
    );
  });

  // TEST 2: The "Massive File" Protection
  it("alerts the user if they try to upload a file larger than 5MB", async () => {
    // Mock window.alert
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    const mockTask = { _id: "1", title: "Test Task", fileUrl: "" };

    // RENDER THE MODAL DIRECTLY to access the input immediately
    const { container } = render(
      <EditTaskModal task={mockTask} onClose={() => {}} onSave={() => {}} />,
    );

    // Create a fake large file (6MB)
    const largeFile = new File(
      ["a".repeat(6 * 1024 * 1024)],
      "huge_image.png",
      { type: "image/png" },
    );

    // Find the file input
    // We use querySelector because file inputs usually don't have a role/label easily accessible
    const fileInput = container.querySelector('input[type="file"]');

    // Simulate upload
    await fireEvent.change(fileInput, { target: { files: [largeFile] } });

    // Verify: Alert was shown
    // Note: This assumes you added the validation logic to EditTaskModal!
    expect(alertMock).toHaveBeenCalled();

    // Cleanup
    alertMock.mockRestore();
  });
});
