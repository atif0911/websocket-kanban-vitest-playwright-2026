import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { socket } from "../socket";

export default function TaskChart() {
  const [tasks, setTasks] = useState([]);

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
  //count calculation
  const todoCount = tasks.filter((t) => t.status === "Todo").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "In Progress",
  ).length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const total = tasks.length;

  //prepare data
  const data = [
    {
      name: "To Do",
      count: todoCount,
      fill: "#8884d8",
    },
    {
      name: "In Progress",
      count: inProgressCount,
      fill: "#82ca9d",
    },
    {
      name: "Done",
      count: doneCount,
      fill: "#ffc658",
    },
  ];

  //completion percentage
  const completionRate =
    total === 0 ? 0 : Math.round((doneCount / total) * 100);
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>Project Dashboard</h2>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            {completionRate}%
          </span>
          <span style={{ display: "block", fontSize: "12px", color: "#666" }}>
            Completion Rate
          </span>
        </div>
      </div>

      {/* chart */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} /> {/* Don't show "1.5 tasks" */}
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              name="Tasks"
              radius={[4, 4, 0, 0]}
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
