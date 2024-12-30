import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_EVENTS } from '@/lib/constants';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001';

export const useWebSocket = (roomId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { roomId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketRef.current.on(WEBSOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on(WEBSOCKET_EVENTS.DISCONNECT, () => {
      console.log('Disconnected from socket server');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  return socketRef.current;
};

export default useWebSocket;