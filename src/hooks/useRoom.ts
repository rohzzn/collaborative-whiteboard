// src/hooks/useRoom.ts

import { useState, useEffect } from 'react';
import useWebSocket from '@/hooks/useWebSocket';
import type { Room, User } from '@/types';

const useRoom = (roomId: string, userName: string = 'Anonymous') => {
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useWebSocket(roomId, userName);

  useEffect(() => {
    console.log('Room Hook Effect - Socket:', socket?.connected);
    
    if (!socket) {
      console.log('No socket available');
      return;
    }

    // Connection successful handler
    const handleConnect = () => {
      console.log('Socket connected successfully');
    };

    // Room state handler
    const handleRoomState = (roomData: Room) => {
      console.log('Received room state:', roomData);
      setRoom(roomData);
      setUsers(roomData.users);
      setIsConnecting(false);
    };

    // User events handlers
    const handleUserJoined = (user: User) => {
      console.log('User joined:', user);
      setUsers(prev => [...prev, user]);
    };

    const handleUserLeft = (userId: string) => {
      console.log('User left:', userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    };

    // Error handler
    const handleError = (error: Error) => {
      console.error('Socket error:', error);
      setError('Failed to connect to room. Please try again.');
      setIsConnecting(false);
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('room_state', handleRoomState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('connect_error', handleError);

    // Connection timeout
    const timeoutId = setTimeout(() => {
      if (isConnecting) {
        console.log('Connection timeout');
        setError('Connection timed out. Please refresh the page.');
        setIsConnecting(false);
      }
    }, 5000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      socket.off('connect', handleConnect);
      socket.off('room_state', handleRoomState);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('connect_error', handleError);
    };
  }, [socket, roomId, userName, isConnecting]);

  return {
    room,
    users,
    isConnecting,
    error,
  };
};

export default useRoom;