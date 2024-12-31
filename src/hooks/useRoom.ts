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

    const handleConnect = () => {
      setIsConnecting(false);
      setError(null);
    };

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

    socket.on('connect', handleConnect);
    socket.on('room_state', handleRoomState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('connect_error', (err: Error) => {
      setError(err.message);
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
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('room_state', handleRoomState);
        socket.off('user_joined', handleUserJoined);
        socket.off('user_left', handleUserLeft);
        socket.off('connect_error');
      }
    };
  }, [socket, roomId, userName, isConnecting]);

  return { room, users, isConnecting, error };
};

export default useRoom;