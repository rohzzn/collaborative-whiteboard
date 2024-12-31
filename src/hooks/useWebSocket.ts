// src/hooks/useWebSocket.ts

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useWebSocket = (roomId: string): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Replace with your actual WebSocket server URL
    const socketIo = io('http://localhost:3001', {
      query: { roomId },
      transports: ['websocket'], // Use WebSocket only
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socketIo.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socketIo.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [roomId]);

  return socket;
};
