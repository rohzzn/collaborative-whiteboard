// src/hooks/useRoom.ts

import { useState, useEffect } from 'react';
import useWebSocket from '@/hooks/useWebSocket';
import type { Room, User } from '@/lib/types';
import { WEBSOCKET_EVENTS } from '@/lib/constants';

const useRoom = (roomId: string) => {
  const socket = useWebSocket(roomId);
  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Handle initial room state
    socket.on(WEBSOCKET_EVENTS.ROOM_STATE, (roomData: Room) => {
      setRoom(roomData);
      setUsers(roomData.users);
      setIsConnecting(false);
    });

    // Handle user events
    socket.on(WEBSOCKET_EVENTS.USER_JOINED, (user: User) => {
      setUsers(prev => [...prev, user]);
    });

    socket.on(WEBSOCKET_EVENTS.USER_LEFT, (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    });

    // Handle errors
    socket.on('connect_error', () => {
      setError('Failed to connect to the room. Please try again.');
      setIsConnecting(false);
    });

    return () => {
      socket.off(WEBSOCKET_EVENTS.ROOM_STATE);
      socket.off(WEBSOCKET_EVENTS.USER_JOINED);
      socket.off(WEBSOCKET_EVENTS.USER_LEFT);
      socket.off('connect_error');
    };
  }, [socket]);

  const updateRoom = (updates: Partial<Room>) => {
    if (!socket || !room) return;
    socket.emit('update_room', updates);
  };

  return {
    room,
    users,
    isConnecting,
    error,
    updateRoom,
  };
};

export default useRoom;
