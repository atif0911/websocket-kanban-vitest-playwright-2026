const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let tasks = []; //in-memory storage
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // TODO: Implement WebSocket events for task management
  // As soon as they connect, send them the current list of tasks.
  socket.emit("tasks:sync", tasks);

  socket.on("task:create", (newTask) => {
    const task = {
      ...newTask,
      id: Date.now().toString(), //Generate a unique id
      status: "todo", //default
    };
    tasks.push(task);

    io.emit("tasks:sync", tasks); //Broadcasting the updated task
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
