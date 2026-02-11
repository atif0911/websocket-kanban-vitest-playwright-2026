import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { createServer } from "http";
import { Server } from "socket.io";
import Client from "socket.io-client";

describe("Kanban WebSocket Server", () => {
  let io, httpServer, clientSocket;
  let port;
  let tasks = [];

  beforeAll(
    () =>
      new Promise((resolve) => {
        httpServer = createServer();
        io = new Server(httpServer);

        io.on("connection", (socket) => {
          socket.emit("tasks:sync", tasks);

          socket.on("task:create", (newTask) => {
            const task = {
              ...newTask,
              id: Date.now().toString(),
              status: "todo",
            };
            tasks.push(task);
            io.emit("tasks:sync", tasks);
          });

          socket.on("task:delete", (taskId) => {
            tasks = tasks.filter((t) => t.id !== taskId);
            io.emit("tasks:sync", tasks);
          });
        });

        httpServer.listen(() => {
          port = httpServer.address().port;
          resolve();
        });
      }),
  );

  afterAll(() => {
    io.close();
    httpServer.close();
  });

  beforeEach(() => {
    tasks = [];
  });

    afterEach(() => {
        if (clientSocket) {
            clientSocket.close();
        }
    })
  //tests
  it("should sync tasks on connection", () =>
    new Promise((done) => {
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on("tasks:sync", (receivedTasks) => {
        expect(receivedTasks).toEqual([]);
        done();
      });
    }));
  it("should create task and broadcast it", () =>
    new Promise((done) => {
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on("connect", () => {
        const newTask = { title: "Backend Test Task", priority: "High" };

        clientSocket.emit("task:create", newTask);
      });

      clientSocket.on("tasks:sync", (receivedTasks) => {
        if (receivedTasks.length === 1) {
          expect(receivedTasks[0].title).toBe("Backend Test Task");
          expect(receivedTasks[0].status).toBe("todo");
          expect(receivedTasks[0].id).toBeDefined();
          done();
        }
      });
    }));
  it("should delete a task", () =>
    new Promise((done) => {
      // Seed data
      const taskToDelete = { id: "999", title: "Delete Me", status: "todo" };
      tasks.push(taskToDelete);
      clientSocket = new Client(`http://localhost:${port}`);

      clientSocket.on("connect", () => {
        clientSocket.emit("task:delete", "999");
      });

      clientSocket.on("tasks:sync", (receivedTasks) => {
        if (receivedTasks.length === 0) {
          expect(receivedTasks).toEqual([]);
          done();
        }
      });
    }));
});
