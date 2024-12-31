// src/hooks/useRoom.ts
import { useState, useEffect } from 'react';
import useWebSocket from './useWebSocket';
import type { Room, User } from '@/types';

export default function useRoom(roomId: string, userName: string = 'Anonymous') {
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

    const handleConnect = () => {
      setIsConnecting(false);
      setError(null);
    };

    const handleRoomState = (roomData: Room) => {
      setRoom(roomData);
      setUsers(roomData.users);
      setIsConnecting(false);
    };

    socket.on('connect', handleConnect);
    socket.on('room_state', handleRoomState);
    socket.on('connect_error', (err: Error) => {
      setError(err.message);
      setIsConnecting(false);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room_state', handleRoomState);
      socket.off('connect_error');
    };
  }, [socket]);

  return { room, users, isConnecting, error };
}
