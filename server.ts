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

  // Notify all users in room (including sender) about the new user
  io.to(roomId).emit('user_joined', user);

  // Send current room state to the new user
  socket.emit('room_state', room);

  // Handle drawing events
  socket.on('stroke_started', (stroke: Stroke) => {
    if (!room) return;

    // Add stroke to room state
    room.strokes.push(stroke);

    // Broadcast to all clients in room immediately
    io.to(roomId).emit('stroke_started', stroke);
  });

  socket.on('stroke_updated', (stroke: Stroke) => {
    if (!room) return;

    // Update stroke in room state
    const index = room.strokes.findIndex(s => s.id === stroke.id);
    if (index !== -1) {
      room.strokes[index] = stroke;
    }

    // Broadcast the update to all clients in room
    io.to(roomId).emit('stroke_updated', stroke);
  });

  socket.on('stroke_completed', (stroke: Stroke) => {
    if (!room) return;

    // Update or add completed stroke
    const index = room.strokes.findIndex(s => s.id === stroke.id);
    if (index !== -1) {
      room.strokes[index] = stroke;
    } else {
      room.strokes.push(stroke);
    }

    // Broadcast to all clients
    io.to(roomId).emit('stroke_completed', stroke);
  });

  socket.on('clear_canvas', () => {
    if (!room) return;
    
    // Clear room strokes
    room.strokes = [];
    
    // Broadcast canvas clear to all clients in room
    io.to(roomId).emit('canvas_cleared');
  });

  socket.on('disconnect', () => {
    if (!room) return;
    
    // Remove user from room
    room.users = room.users.filter(u => u.id !== socket.id);
    
    // Notify all remaining users
    io.to(roomId).emit('user_left', socket.id);
    io.to(roomId).emit('room_state', room);
    
    // Remove room if empty
    if (room.users.length === 0) {
      rooms.delete(roomId);
    }
  });
});

export default io;