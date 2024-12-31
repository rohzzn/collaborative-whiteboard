// src/hooks/useWebSocket.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export const useWebSocket = (roomId: string): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketIo = io(SOCKET_URL, {
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

    // Use the Error type instead of any
    socketIo.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [roomId]);

  return socket;
};

export default useWebSocket;
