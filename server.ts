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

// Define User type
interface User {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

// Define Room type
interface Room {
  id: string;
  name: string;
  users: User[];
  strokes: Stroke[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for rooms
const rooms: Record<string, Room> = {};

// Utility function to generate random color
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Handle client connections
io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // Extract roomId and userName from query
  const roomIdParam = socket.handshake.query.roomId;
  const userNameParam = socket.handshake.query.userName;

  if (typeof roomIdParam !== 'string') {
    console.error(`User ${socket.id} did not provide a valid roomId`);
    socket.disconnect();
    return;
  }

  const roomId = roomIdParam;

  // Get or create the room
  if (!rooms[roomId]) {
    rooms[roomId] = {
      id: roomId,
      name: `Room ${roomId.substring(0, 8)}`,
      users: [],
      strokes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const room = rooms[roomId];

  // Get userName
  const userName = typeof userNameParam === 'string' && userNameParam.trim() !== '' ? userNameParam : `User-${socket.id.substring(0, 5)}`;

  // Assign a color to the user
  const userColor = getRandomColor();

  const user: User = {
    id: socket.id,
    name: userName,
    color: userColor,
    isActive: true,
    lastSeen: new Date(),
  };

  // Add user to room
  room.users.push(user);
  socket.join(roomId);
  console.log(`User ${socket.id} joined room ${roomId}`);

  // Emit 'room_state' to the connecting client
  socket.emit('room_state', room);

  // Emit 'user_joined' to other clients in the room
  socket.to(roomId).emit('user_joined', user);

  // Handle 'stroke_added' events from clients
  socket.on('stroke_added', (stroke: Stroke) => {
    // Add stroke to room
    room.strokes.push(stroke);
    room.updatedAt = new Date();

    // Broadcast the stroke to all other clients in the same room
    socket.to(roomId).emit('stroke_added', stroke);
  });

  // Handle client disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from room
    const userIndex = room.users.findIndex(u => u.id === socket.id);
    if (userIndex !== -1) {
      const [leftUser] = room.users.splice(userIndex, 1);

      // Emit 'user_left' to other clients in the room
      socket.to(roomId).emit('user_left', leftUser.id);

      // Emit updated 'room_state'
      io.to(roomId).emit('room_state', room);
    }

    // If room is empty, delete it
    if (room.users.length === 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted as it became empty.`);
    }
  });
});