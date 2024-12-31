// src/hooks/useWebSocket.ts

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export const useWebSocket = (roomId: string, userName: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) {
      console.error('No room ID provided');
      return;
    }

    console.log('Initializing WebSocket:', {
      url: SOCKET_URL,
      roomId,
      userName
    });

    // Create socket instance
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: {
        roomId,
        userName
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    // Store socket reference
    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userName]);

  return socketRef.current;
};

export default useWebSocket;