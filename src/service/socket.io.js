import { Server as SocketServer } from "socket.io";

let io;

// Initialize and configure Socket.IO
export const initializeSocket = (server) => {
  io = new SocketServer(server, {
    cors: {
      origin: "*", // Replace with specific origin if needed
      // origin: "http://localhost:3000/", // Replace with specific origin if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Example event listener
    socket.on("message", (data) => {
      console.log("Message received:", data);
      io.emit("message", data); // Broadcast the message to all clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

// Export function to get the initialized IO instance
export const getIo = () => io;
