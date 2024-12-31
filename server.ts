// server.ts

import { Server } from 'socket.io';
import cors from 'cors';

// Initialize Socket.io server
const io = new Server(3001, {
  cors: {
    origin: 'http://localhost:3000', // Frontend origin
    methods: ['GET', 'POST'],
  },
});

// Handle connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room based on roomId
  const { roomId } = socket.handshake.query;
  socket.join(roomId);
  console.log(`User ${socket.id} joined room ${roomId}`);

  // Handle stroke_added event
  socket.on('stroke_added', (stroke) => {
    // Broadcast to other users in the room
    socket.to(roomId).emit('stroke_added', stroke);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
