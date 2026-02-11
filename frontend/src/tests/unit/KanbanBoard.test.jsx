import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react"; 
import { describe, it, expect, vi, beforeEach } from "vitest";
import KanbanBoard from "../../components/KanbanBoard";
import { socket } from "../../socket";

vi.mock("../../socket", () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
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

vi.mock("../../components/TaskCard", () => ({
  default: ({ task, onDelete, onUpdate }) => (
    <div data-testid="task-card">
      <span>{task.title}</span>
      <button onClick={onDelete}>MockDelete</button>
      <button onClick={onUpdate}>MockEdit</button>
    </div>
  ),
}));

vi.mock("../../components/EditTaskModal", () => ({
  default: ({ task, onSave, onClose }) => (
    <div data-testid="edit-modal">
      <button onClick={() => onSave({ ...task, title: "Updated Task Title" })}>
        MockSave
      </button>
      <button onClick={onClose}>MockCancel</button>
    </div>
  ),
}));

describe("KanbanBoard Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the board columns and add task bar", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("renders tasks when receiving 'tasks:initial' from socket", async () => {
    render(<KanbanBoard />);

    const initCall = socket.on.mock.calls.find(
      (call) => call[0] === "tasks:initial",
    );
    const callback = initCall[1];

    await act(async () => {
      callback([
        { _id: "1", title: "Task 1", status: "Todo", priority: "High" },
        { _id: "2", title: "Task 2", status: "Done", priority: "Low" },
      ]);
    });

    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
      expect(screen.getByText("Task 2")).toBeInTheDocument();
    });
  });

  it("emits 'task:delete' and removes task optimistically", async () => {
    render(<KanbanBoard />);

    const initCall = socket.on.mock.calls.find(
      (call) => call[0] === "tasks:initial",
    );

    await act(async () => {
      initCall[1]([{ _id: "100", title: "Delete Me", status: "Todo" }]);
    });

    await waitFor(() => {
      expect(screen.getByText("MockDelete")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByText("MockDelete");
    fireEvent.click(deleteBtn);

    expect(socket.emit).toHaveBeenCalledWith("task:delete", "100");

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });

  it("opens modal on edit click and emits 'task:update' on save", async () => {
    render(<KanbanBoard />);

    const initCall = socket.on.mock.calls.find(
      (call) => call[0] === "tasks:initial",
    );

    await act(async () => {
      initCall[1]([{ _id: "200", title: "Old Title", status: "Todo" }]);
    });

    await waitFor(() => {
      expect(screen.getByText("MockEdit")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("MockEdit"));

    expect(screen.getByTestId("edit-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("MockSave"));

    expect(socket.emit).toHaveBeenCalledWith(
      "task:update",
      expect.objectContaining({
        _id: "200",
        title: "Updated Task Title",
      }),
    );
  });

  it("updates UI when receiving 'task:created' event from server", async () => {
    render(<KanbanBoard />);

    const createCall = socket.on.mock.calls.find(
      (call) => call[0] === "task:created",
    );
    const callback = createCall[1];

    await act(async () => {
      callback({ _id: "300", title: "Incoming Task", status: "Todo" });
    });

    await waitFor(() => {
      expect(screen.getByText("Incoming Task")).toBeInTheDocument();
    });
  });
});
