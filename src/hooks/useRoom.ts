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
      // Filter out duplicates by name
      const uniqueUsers = roomData.users.reduce((acc: User[], user) => {
        if (!acc.find(u => u.name === user.name)) {
          acc.push(user);
        }
        return acc;
      }, []);
      setUsers(uniqueUsers);
      setIsConnecting(false);
    };

    const handleUserJoined = (user: User) => {
      setUsers(prev => {
        // Remove any existing user with the same name
        const filtered = prev.filter(u => u.name !== user.name);
        return [...filtered, user];
      });
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

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('room_state', handleRoomState);
        socket.off('user_joined', handleUserJoined);
        socket.off('user_left', handleUserLeft);
        socket.off('connect_error');
      }
    };
  }, [socket]);

  return { room, users, isConnecting, error };
};

export default useRoom;