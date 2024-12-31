// server.ts
import { Server } from 'socket.io';
import type { Room, User, Stroke } from './src/types';

const io = new Server(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const rooms = new Map<string, Room>();

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  return colors[Math.floor(Math.random() * colors.length)];
};

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  const roomId = socket.handshake.query.roomId as string;
  const userName = socket.handshake.query.userName as string;

  if (!roomId || !userName) {
    socket.disconnect();
    return;
  }

  // Get or create room
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
  }

  // Add user to room
  const user: User = {
    id: socket.id,
    name: userName,
    color: getRandomColor(),
    isActive: true,
    lastSeen: new Date(),
  };

  // Remove any existing user with the same name
  room.users = room.users.filter(u => u.name !== userName);
  room.users.push(user);
  socket.join(roomId);

  // Send current room state to the new user
  console.log('Sending room state:', room);
  socket.emit('room_state', room);

  // Handle drawing events
  socket.on('stroke_started', (stroke: Stroke) => {
    console.log('Stroke started:', stroke);
    if (!room) return;
    room.strokes.push(stroke);
    socket.to(roomId).emit('stroke_started', stroke);
  });

  socket.on('stroke_updated', (stroke: Stroke) => {
    console.log('Stroke updated:', stroke);
    if (!room) return;
    const index = room.strokes.findIndex(s => s.id === stroke.id);
    if (index !== -1) {
      room.strokes[index] = stroke;
    }
    socket.to(roomId).emit('stroke_updated', stroke);
  });

  socket.on('stroke_completed', (stroke: Stroke) => {
    console.log('Stroke completed:', stroke);
    if (!room) return;
    const index = room.strokes.findIndex(s => s.id === stroke.id);
    if (index !== -1) {
      room.strokes[index] = stroke;
    } else {
      room.strokes.push(stroke);
    }
    socket.to(roomId).emit('stroke_completed', stroke);
  });

  socket.on('clear_canvas', () => {
    console.log('Canvas cleared');
    if (!room) return;
    room.strokes = [];
    socket.to(roomId).emit('canvas_cleared');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (!room) return;
    
    room.users = room.users.filter(u => u.id !== socket.id);
    io.to(roomId).emit('room_state', room);
    
    if (room.users.length === 0) {
      rooms.delete(roomId);
    }
  });
});