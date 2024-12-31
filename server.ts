// server.ts
import { Server, Socket } from 'socket.io';

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

const io = new Server(3001, {
 cors: {
   origin: process.env.NODE_ENV === 'production' 
     ? 'https://your-production-url.com'
     : 'http://localhost:3000',
   methods: ['GET', 'POST'],
   credentials: true,
 },
});

const rooms = new Map<string, Room>();

const getRandomColor = () => {
 const letters = '0123456789ABCDEF';
 let color = '#';
 for (let i = 0; i < 6; i++) {
   color += letters[Math.floor(Math.random() * 16)];
 }
 return color;
};

io.on('connection', (socket: Socket) => {
 console.log('User connected:', socket.id);

 const roomId = socket.handshake.query.roomId as string;
 const userName = socket.handshake.query.userName as string || `User-${socket.id.slice(0, 5)}`;

 if (!roomId) {
   console.error('No room ID provided');
   socket.disconnect();
   return;
 }

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

 // Remove existing user with same name
 room.users = room.users.filter(u => u.name !== userName);

 const user: User = {
   id: socket.id,
   name: userName,
   color: getRandomColor(),
   isActive: true,
   lastSeen: new Date(),
 };

 room.users.push(user);
 socket.join(roomId);

 socket.emit('room_state', room);
 io.to(roomId).emit('user_joined', user);

 // Handle drawing events
 socket.on('stroke_started', (stroke: Stroke) => {
   if (room) {
     socket.to(roomId).emit('stroke_started', stroke);
   }
 });

 socket.on('stroke_updated', (stroke: Stroke) => {
   if (room) {
     socket.to(roomId).emit('stroke_updated', stroke);
   }
 });

 socket.on('stroke_completed', (stroke: Stroke) => {
   if (room) {
     room.strokes.push(stroke);
     room.updatedAt = new Date();
     socket.to(roomId).emit('stroke_completed', stroke);
   }
 });

 socket.on('clear_canvas', () => {
   if (room) {
     room.strokes = [];
     room.updatedAt = new Date();
     socket.to(roomId).emit('canvas_cleared');
   }
 });

 socket.on('disconnect', () => {
   console.log('User disconnected:', socket.id);
   if (room) {
     room.users = room.users.filter(u => u.id !== socket.id);
     io.to(roomId).emit('user_left', socket.id);
     
     if (room.users.length === 0) {
       rooms.delete(roomId);
       console.log(`Room ${roomId} deleted as it became empty`);
     }
   }
 });
});

console.log('WebSocket server running on port 3001');