import { useEffect, useState } from "react";
import { socket } from "./socket";
import KanbanBoard from "./components/KanbanBoard";
import TaskChart from "./components/TaskChart";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    socket.connect();

    //Event listeners
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onTasksSync(serverTasks) {
      console.log("Syncing tasks...", serverTasks); // Debug log
      setTasks(serverTasks);
    }

    //listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("tasks:sync", onTasksSync);

    //cleanup to avoid memory leaks
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("tasks:sync", onTasksSync);
      socket.disconnect();
    };
  }, []);
  return (
    <div
      className="App"
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Real-Time Kanban Board</h1>
        <div
          style={{ fontSize: "0.9em", color: isConnected ? "green" : "red" }}
        >
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
      {/* dashboard */}
      <TaskChart tasks={tasks} />

      {/* board */}
      <KanbanBoard tasks={tasks} />
    </div>
  );
}

export default App;
