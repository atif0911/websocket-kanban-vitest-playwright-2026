require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Task = require("./models/Task");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kanban-uploads",
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const upload = multer({ storage: storage });

const connectDB = require("./db");
connectDB();

const allowedOrigins = [
  "http://localhost:3000", // Keep this for local development
  "http://localhost:5173", // Vite local dev
  "https://websocket-kanban-vitest-playwright-ecru.vercel.app", // <--- ADD THIS!
];

const app = express();
app.use(
  cors({
    origin: allowedOrigins || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.post("/api/upload", (req, res) => {
  const uploadSingle = upload.single("file");

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("MULTER ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Upload Success:", req.file.path);
    res.json({ fileUrl: req.file.path });
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // TODO: Implement WebSocket events for task management
  // As soon as they connect, send them the current list of tasks.

  socket.on("task:load", async () => {
    const tasks = await Task.find();
    socket.emit("tasks:initial", tasks);
  });

  socket.on("task:create", async (data) => {
    try {
      const newTask = await Task.create(data);
      io.emit("task:created", newTask);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("task:move", async ({ taskId, newStatus }) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status: newStatus },
        { new: true },
      );
      io.emit("task:moved", updatedTask);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("task:delete", async (taskId) => {
    try {
      await Task.findByIdAndDelete(taskId);
      io.emit("task:deleted", taskId);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("task:update", async (updatedData) => {
    try {
      const { _id, ...rest } = updatedData;
      const updatedTask = await Task.findByIdAndUpdate(_id, rest, {
        new: true,
      });
      if (updatedTask) {
        io.emit("task:updated", updatedTask);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
