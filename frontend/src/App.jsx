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
      console.log("Connected to server!");
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log("DisConnected from server!");
    }
    function onTaskSync(serverTasks) {
      console.log("Tasks Received:", serverTasks);
      setTasks(serverTasks);
    }

    //listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("tasks:sync", onTaskSync);

    //cleanup to avoid memory leaks
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("tasks:sync", onTaskSync);
      socket.disconnect();
    };
  }, []);
  return (
    <div className="App">
      <h1>Real-time Kanban Board</h1>
      <KanbanBoard />
      <p>
        Connection Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </p>

      {/* Temporary Debug List */}
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
}

export default App;
