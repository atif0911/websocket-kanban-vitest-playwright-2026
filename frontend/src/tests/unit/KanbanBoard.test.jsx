// import { render, screen } from "@testing-library/react";import { describe, it, expect, vi } from "vitest";
// import KanbanBoard from "../../src/components/KanbanBoard";

// test("renders Kanban board title", () => {
//   render(<KanbanBoard />);
//   expect(screen.getByText("Kanban Board")).toBeInTheDocument();
// });

// // TODO: Add more unit tests for individual components
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard"; // FIXED PATH

// Mock the socket so the component doesn't crash trying to connect
vi.mock("../../socket", () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

describe("KanbanBoard Unit Tests", () => {
  it("renders the 3 columns correctly", () => {
    render(<KanbanBoard tasks={[]} />);

    // Check for the column headers we know exist
    expect(screen.getByText(/todo/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Done/i)).toBeInTheDocument();
  });

  it("renders the Add Task button", () => {
    render(<KanbanBoard tasks={[]} />);
    expect(
      screen.getByRole("button", { name: /Add Task/i }),
    ).toBeInTheDocument();
  });
});
