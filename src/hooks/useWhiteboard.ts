// src/hooks/useWhiteboard.ts
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DrawingTool, Stroke, Point } from '@/types';
import { DEFAULT_COLOR, DEFAULT_STROKE_WIDTH } from '@/lib/constants';
import useWebSocket from './useWebSocket';

export default function useWhiteboard(roomId: string) {
  const socket = useWebSocket(roomId, '');
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);
  const [tool, setTool] = React.useState<DrawingTool>('pencil');
  const [color, setColor] = React.useState(DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = React.useState(DEFAULT_STROKE_WIDTH);

  React.useEffect(() => {
    if (!socket) return;

    socket.on('room_state', (room) => {
      if (room.strokes) {
        console.log('Received room state with strokes:', room.strokes);
        setStrokes(room.strokes);
      }
    });

    socket.on('stroke_started', (stroke: Stroke) => {
      console.log('Received stroke_started:', stroke);
      setStrokes(prev => [...prev, stroke]);
    });

    socket.on('stroke_updated', (stroke: Stroke) => {
      console.log('Received stroke_updated:', stroke);
      setStrokes(prev => prev.map(s => s.id === stroke.id ? stroke : s));
    });

    socket.on('stroke_completed', (stroke: Stroke) => {
      console.log('Received stroke_completed:', stroke);
      setStrokes(prev => [
        ...prev.filter(s => s.id !== stroke.id),
        stroke
      ]);
    });

    socket.on('canvas_cleared', () => {
      console.log('Received canvas_cleared');
      setStrokes([]);
    });

    return () => {
      socket.off('room_state');
      socket.off('stroke_started');
      socket.off('stroke_updated');
      socket.off('stroke_completed');
      socket.off('canvas_cleared');
    };
  }, [socket]);

  const startStroke = (point: Point) => {
    const newStroke: Stroke = {
      id: uuidv4(),
      type: tool,
      points: [point],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
    };

    if (tool === 'text' && point.text) {
      newStroke.text = point.text;
    }

    setCurrentStroke(newStroke);
    socket?.emit('stroke_started', newStroke);
  };

  const updateStroke = (point: Point) => {
    if (!currentStroke) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point]
    };

    setCurrentStroke(updatedStroke);
    socket?.emit('stroke_updated', updatedStroke);
  };

  const endStroke = () => {
    if (!currentStroke) return;

    const finalStroke = currentStroke;
    setStrokes(prev => [...prev, finalStroke]);
    setCurrentStroke(null);
    socket?.emit('stroke_completed', finalStroke);
  };

  const drawShape = (points: Point[]) => {
    if (points.length < 2) return;

    const shape: Stroke = {
      id: uuidv4(),
      type: tool,
      points,
      color,
      width: strokeWidth
    };

    setStrokes(prev => [...prev, shape]);
    socket?.emit('stroke_completed', shape);
  };

  const addText = (point: Point, text: string) => {
    const textStroke: Stroke = {
      id: uuidv4(),
      type: 'text',
      points: [{ ...point, text }],
      color,
      width: strokeWidth,
      text
    };

    setStrokes(prev => [...prev, textStroke]);
    socket?.emit('stroke_completed', textStroke);
  };

  const clear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    socket?.emit('clear_canvas');
  };

  return {
    strokes,
    currentStroke,
    tool,
    color,
    strokeWidth,
    setTool,
    setColor,
    setStrokeWidth,
    startStroke,
    updateStroke,
    endStroke,
    drawShape,
    addText,
    clear,
    canUndo: strokes.length > 0,
    canRedo: false
  };
}