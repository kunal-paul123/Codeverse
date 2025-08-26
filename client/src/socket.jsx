import { io } from "socket.io-client";

let socket = null;

export const initSocket = async () => {
  if (!socket) {
    const option = {
      // "force new connection": true,
      reconnectionAttempt: "infinity",
      timeout: 10000,
      transports: ["websocket"],
    };

    socket = io(import.meta.env.VITE_BACKEND_URL, option);
  }

  return socket;
};
