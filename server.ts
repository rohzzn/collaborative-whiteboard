// server.ts
import { Server, Socket } from 'socket.io';

// Interfaces
interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  id: string;
  type: 'pencil' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'eraser';
  points: Point[];
  color: string;
  width: number;
  text?: string;
}

interface User {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

interface Room {
  id: string;
  name: string;
  users: User[];
  strokes: Stroke[];
  createdAt: Date;
  updatedAt: Date;
}

// Initialize server
const io = new Server(3001, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-url.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store rooms in memory
const rooms = new Map<string, Room>();

// Utility function to generate random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Handle socket connections
io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  const roomId = socket.handshake.query.roomId as string;
  const userName = socket.handshake.query.userName as string || `User-${socket.id.slice(0, 5)}`;

  if (!roomId) {
    console.error('No room ID provided');
    socket.disconnect();
    return;
  }

  // Create or join room
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      name: `Room ${roomId.slice(0, 8)}`,
      users: [],
      strokes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rooms.set(roomId, room);
    console.log(`Created new room: ${roomId}`);
  }

  // Add user to room
  const user: User = {
    id: socket.id,
    name: userName,
    color: getRandomColor(),
    isActive: true,
    lastSeen: new Date(),
  };

  room.users.push(user);
  socket.join(roomId);

  // Send initial state
  socket.emit('room_state', room);
  socket.to(roomId).emit('user_joined', user);
  console.log(`User ${userName} (${socket.id}) joined room ${roomId}`);

  // Handle strokes
  socket.on('stroke_added', (stroke: Stroke) => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom) {
      currentRoom.strokes.push(stroke);
      currentRoom.updatedAt = new Date();
      socket.to(roomId).emit('stroke_added', stroke);
    }
  });

  // Handle clear canvas
  socket.on('clear_canvas', () => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom) {
      currentRoom.strokes = [];
      currentRoom.updatedAt = new Date();
      socket.to(roomId).emit('strokes_cleared');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const currentRoom = rooms.get(roomId);
    if (currentRoom) {
      currentRoom.users = currentRoom.users.filter(u => u.id !== socket.id);
      socket.to(roomId).emit('user_left', socket.id);

      if (currentRoom.users.length === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted as it became empty`);
      }
    }
  });
});

console.log('WebSocket server running on port 3001');