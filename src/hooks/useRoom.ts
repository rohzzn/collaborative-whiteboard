// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

const useWebSocket = (roomId: string, userName: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    try {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          query: { roomId, userName },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        });
      }
    } catch (error) {
      console.error('Socket initialization error:', error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userName]);

  return socketRef.current;
};

export default useWebSocket;

// src/hooks/useRoom.ts
import { useState, useEffect } from 'react';
import useWebSocket from './useWebSocket';
import type { Room, User } from '@/types';

const useRoom = (roomId: string, userName: string = 'Anonymous') => {
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useWebSocket(roomId, userName);

  useEffect(() => {
    if (!socket) {
      setError('Socket connection failed');
      setIsConnecting(false);
      return;
    }

    const handleRoomState = (roomData: Room) => {
      setRoom(roomData);
      setUsers(roomData.users);
      setIsConnecting(false);
    };

    const handleUserJoined = (user: User) => {
      setUsers(prev => [...prev, user]);
    };

    const handleUserLeft = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    };

    socket.on('connect', () => setIsConnecting(false));
    socket.on('room_state', handleRoomState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('connect_error', (error: Error) => {
      setError(error.message);
      setIsConnecting(false);
    });

    const timeout = setTimeout(() => {
      if (isConnecting) {
        setError('Connection timed out');
        setIsConnecting(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      socket.off('connect');
      socket.off('room_state');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('connect_error');
    };
  }, [socket, roomId, userName, isConnecting]);

  return { room, users, isConnecting, error };
};

export default useRoom;