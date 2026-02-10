import { useEffect, useState } from "react";
import { socket } from "./socket";
import KanbanBoard from "./components/KanbanBoard";

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
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <h1>Real-time Kanban Board</h1>

      <div
        style={{
          marginBottom: "20px",
          fontSize: "0.9em",
          color: isConnected ? "green" : "red",
        }}
      >
        {isConnected ? "🟢 Connected to Server" : "🔴 Disconnected"}
      </div>
      <KanbanBoard tasks={tasks} />
    </div>
  );
}

export default App;
