// src/components/rooms/RoomClient.tsx
'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useRoom from '@/hooks/useRoom';
import useWhiteboard from '@/hooks/useWhiteboard';
import useUser from '@/hooks/useUser';
import Canvas from '@/components/whiteboard/Canvas';
import Toolbar from '@/components/whiteboard/Toolbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Point } from '@/types';

interface RoomClientProps {
  roomId: string;
}

const RoomClient: React.FC<RoomClientProps> = ({ roomId }) => {
  const { name: userName } = useUser();
  const { users, isConnecting, error } = useRoom(roomId, userName || 'Anonymous');
  const {
    tool,
    color,
    strokeWidth,
    canUndo,
    canRedo,
    setTool,
    setColor,
    setStrokeWidth,
    startStroke,
    updateStroke,
    endStroke,
    undo,
    redo,
  } = useWhiteboard(roomId);

  useEffect(() => {
    // Log connection status for debugging
    console.log('Connection status:', {
      roomId,
      userName,
      isConnecting,
      error,
      usersCount: users.length
    });
  }, [roomId, userName, isConnecting, error, users]);

  const handleStrokeStart = (point: Point) => {
    console.log('Stroke started');
    startStroke(point);
  };

  const handleStrokeUpdate = (point: Point) => {
    updateStroke(point);
  };
  const handleStrokeComplete = (points: ReadonlyArray<Point>) => {
    console.log('Stroke completed');
    endStroke();
  };
  
  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => alert('Room URL copied to clipboard!'),
      () => alert('Failed to copy URL.')
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connecting...</CardTitle>
            <CardDescription>
              Establishing connection to the whiteboard room...
              <br />
              Room ID: {roomId}
              <br />
              User Name: {userName || 'Anonymous'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-2">
            <Toolbar
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              canUndo={canUndo}
              canRedo={canRedo}
              onToolChange={setTool}
              onColorChange={setColor}
              onStrokeWidthChange={setStrokeWidth}
              onUndo={undo}
              onRedo={redo}
              onExport={handleExport}
              onShare={handleShare}
            />
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden">
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Canvas
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              onStrokeStart={handleStrokeStart}
              onStrokeUpdate={handleStrokeUpdate}
              onStrokeComplete={handleStrokeComplete}
            />
          </motion.div>
        </main>

        <aside className="fixed right-4 top-20 z-10">
          <Card className="w-48">
            <CardHeader>
              <CardTitle className="text-sm">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span>{user.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </TooltipProvider>
  );
};

export default RoomClient;