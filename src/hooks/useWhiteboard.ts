// src/hooks/useWhiteboard.ts
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DrawingTool, Stroke, Point } from '@/types';
import { DEFAULT_COLOR, DEFAULT_STROKE_WIDTH } from '@/lib/constants';
import useWebSocket from './useWebSocket';

export default function useWhiteboard(roomId: string) {
  const socket = useWebSocket(roomId, '');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [tool, setTool] = useState<DrawingTool>('pencil');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleStrokeStarted = (stroke: Stroke) => {
      console.log('Received stroke_started:', stroke);
      setStrokes(prev => [...prev, stroke]);
    };

    const handleStrokeUpdated = (updatedStroke: Stroke) => {
      console.log('Received stroke_updated:', updatedStroke);
      setStrokes(prev =>
        prev.map(stroke => 
          stroke.id === updatedStroke.id ? updatedStroke : stroke
        )
      );
    };

    const handleStrokeCompleted = (completedStroke: Stroke) => {
      console.log('Received stroke_completed:', completedStroke);
      setStrokes(prev => {
        const newStrokes = prev.map(stroke =>
          stroke.id === completedStroke.id ? completedStroke : stroke
        );
        if (!prev.find(s => s.id === completedStroke.id)) {
          newStrokes.push(completedStroke);
        }
        const updatedStrokes = [...newStrokes];
        setHistory(h => [...h.slice(0, historyIndex + 1), updatedStrokes]);
        setHistoryIndex(i => i + 1);
        return updatedStrokes;
      });
    };

    const handleRoomState = (room: any) => {
      if (room.strokes) {
        console.log('Setting initial strokes:', room.strokes);
        setStrokes(room.strokes);
        setHistory([room.strokes]);
        setHistoryIndex(0);
      }
    };

    socket.on('room_state', handleRoomState);
    socket.on('stroke_started', handleStrokeStarted);
    socket.on('stroke_updated', handleStrokeUpdated);
    socket.on('stroke_completed', handleStrokeCompleted);
    socket.on('canvas_cleared', () => {
      setStrokes([]);
      setHistory([[]]);
      setHistoryIndex(0);
    });

    return () => {
      socket.off('room_state');
      socket.off('stroke_started');
      socket.off('stroke_updated');
      socket.off('stroke_completed');
      socket.off('canvas_cleared');
    };
  }, [socket, historyIndex]);

  const startStroke = (point: Point) => {
    const newStroke: Stroke = {
      id: uuidv4(),
      type: tool,
      points: [point],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
      text: point.text,
    };

    setCurrentStroke(newStroke);
    socket?.emit('stroke_started', newStroke);
  };

  const updateStroke = (point: Point) => {
    if (!currentStroke) return;

    let updatedStroke: Stroke;

    if (tool === 'rectangle' || tool === 'circle' || tool === 'arrow') {
      // For shapes, we only need start and current point
      updatedStroke = {
        ...currentStroke,
        points: [currentStroke.points[0], point]
      };
    } else {
      // For freehand drawing, add point to the stroke
      updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, point]
      };
    }

    setCurrentStroke(updatedStroke);
    socket?.emit('stroke_updated', updatedStroke);
  };

  const endStroke = () => {
    if (!currentStroke) return;

    let finalStroke = currentStroke;

    // For shapes, ensure we have proper points
    if ((tool === 'rectangle' || tool === 'circle' || tool === 'arrow') && 
        currentStroke.points.length < 2) {
      finalStroke = {
        ...currentStroke,
        points: [...currentStroke.points, currentStroke.points[0]]
      };
    }

    setStrokes(prev => {
      const newStrokes = [...prev, finalStroke];
      setHistory(h => [...h.slice(0, historyIndex + 1), newStrokes]);
      setHistoryIndex(i => i + 1);
      return newStrokes;
    });

    setCurrentStroke(null);
    socket?.emit('stroke_completed', finalStroke);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      socket?.emit('canvas_cleared');
      history[newIndex].forEach(stroke => {
        socket?.emit('stroke_completed', stroke);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      socket?.emit('canvas_cleared');
      history[newIndex].forEach(stroke => {
        socket?.emit('stroke_completed', stroke);
      });
    }
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
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}