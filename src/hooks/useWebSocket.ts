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

    try {
      // Create socket instance if it doesn't exist
      if (!socketRef.current) {
        console.log('Creating new socket connection to:', SOCKET_URL);
        socketRef.current = io(SOCKET_URL, {
          transports: ['websocket', 'polling'], // Add polling as fallback
          query: {
            roomId,
            userName
          },
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true // Ensure auto connection is enabled
        });

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

        socket.on('error', (error: Error) => {
          console.error('Socket error:', error);
        });

        // Force connect if not already connecting
        if (!socket.connected && !socket.connecting) {
          socket.connect();
        }
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, userName]);

  return socketRef.current;
};

export default useWebSocket;