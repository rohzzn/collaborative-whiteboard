// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

const useWebSocket = (roomId: string, userName: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        query: { roomId, userName },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userName]);

  return socketRef.current;
};

export default useWebSocket;