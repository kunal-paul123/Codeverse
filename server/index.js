import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(server);

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return { socketId, username: userSocketMap[socketId] };
    }
  );
};

io.on("connection", (socket) => {
  //   console.log(`user connected: ${socket.id}`);

  socket.on("join", ({ roomId, username }) => {
    // console.log(`${username} joined room: ${roomId}`);
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    //notify to all user that new user is joined
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });

    // Ask one of the existing clients to send the current code to the new user
    const existingClient = clients.find((c) => c.socketId !== socket.id);
    if (existingClient) {
      io.to(existingClient.socketId).emit("sync-request", {
        socketId: socket.id,
      });
    }
  });

  // Live code changes → to everyone else in the room
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
  });

  // Initial sync: an existing client sends code directly to the new client's socketId
  socket.on("sync-code", ({ socketId, code }) => {
    io.to(socketId).emit("code-change", { code });
  });

  socket.on("language-change", ({ roomId, language }) => {
    socket.to(roomId).emit("language-change", { language });
  });

  // Leave room manually
  socket.on("leave-room", ({ roomId }) => {
    handleDisconnect(socket, roomId);
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => handleDisconnect(socket, roomId));
  });
});

const handleDisconnect = (socket, roomId) => {
  socket.leave(roomId);
  socket.to(roomId).emit("disconnected", {
    socketId: socket.id,
    username: userSocketMap[socket.id],
  });
  delete userSocketMap[socket.id];
};

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
