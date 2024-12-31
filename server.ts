// server.ts

import { Server, Socket } from 'socket.io';

// Initialize Socket.io server on port 3001 with CORS settings
const io = new Server(3001, {
  cors: {
    origin: 'http://localhost:3000', // Frontend origin
    methods: ['GET', 'POST'],
  },
});

// Define Point type
interface Point {
  x: number;
  y: number;
  pressure?: number;
}

// Define Stroke type
interface Stroke {
  id: string;
  type: string;
  points: Point[];
  color: string;
  width: number;
}

// Handle client connections
io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room based on roomId
  const roomIdParam = socket.handshake.query.roomId;

  if (typeof roomIdParam !== 'string') {
    console.error(`User ${socket.id} did not provide a valid roomId`);
    socket.disconnect();
    return;
  }

  const roomId = roomIdParam;

  socket.join(roomId);
  console.log(`User ${socket.id} joined room ${roomId}`);

  // Handle 'stroke_added' events from clients
  socket.on('stroke_added', (stroke: Stroke) => {
    // Broadcast the stroke to all other clients in the same room
    socket.to(roomId).emit('stroke_added', stroke);
  });

  // Handle client disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
