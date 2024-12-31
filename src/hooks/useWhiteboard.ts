// src/hooks/useWhiteboard.ts
import { useEffect } from 'react';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { DrawingTool, Stroke, Point } from '@/types';
import { DEFAULT_COLOR, DEFAULT_STROKE_WIDTH } from '@/lib/constants';
import useWebSocket from './useWebSocket';

interface WhiteboardState {
  strokes: Stroke[];
  currentStroke: Stroke | null;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
  undoStack: Stroke[];
  redoStack: Stroke[];
}

interface WhiteboardStore extends WhiteboardState {
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  startStroke: (point: Point) => void;
  updateStroke: (point: Point) => void;
  endStroke: () => Stroke | null;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  addStroke: (stroke: Stroke) => void;
}

const useWhiteboardStore = create<WhiteboardStore>((set, get) => ({
  strokes: [],
  currentStroke: null,
  tool: 'pencil',
  color: DEFAULT_COLOR,
  strokeWidth: DEFAULT_STROKE_WIDTH,
  isDrawing: false,
  undoStack: [],
  redoStack: [],

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  startStroke: (point) => {
    const { tool, color, strokeWidth } = get();
    const stroke: Stroke = {
      id: uuidv4(),
      type: tool === 'eraser' ? 'eraser' : tool,
      points: [point],
      color: tool === 'eraser' ? '#FFFFFF' : color,
      width: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
    };
    set({ currentStroke: stroke, isDrawing: true });
    return stroke;
  },

  updateStroke: (point) => {
    const { currentStroke, isDrawing } = get();
    if (!isDrawing || !currentStroke) return null;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    set({ currentStroke: updatedStroke });
    return updatedStroke;
  },

  endStroke: () => {
    const { currentStroke, strokes } = get();
    if (!currentStroke) return null;

    set({
      strokes: [...strokes, currentStroke],
      currentStroke: null,
      isDrawing: false,
      undoStack: [],
      redoStack: [],
    });

    return currentStroke;
  },

  addStroke: (stroke) => {
    const { strokes } = get();
    set({ strokes: [...strokes, stroke] });
  },

  undo: () => {
    const { strokes, undoStack } = get();
    if (strokes.length === 0) return;

    const lastStroke = strokes[strokes.length - 1];
    set({
      strokes: strokes.slice(0, -1),
      undoStack: [...undoStack, lastStroke],
    });
  },

  redo: () => {
    const { strokes, undoStack } = get();
    if (undoStack.length === 0) return;

    const strokeToRedo = undoStack[undoStack.length - 1];
    set({
      strokes: [...strokes, strokeToRedo],
      undoStack: undoStack.slice(0, -1),
    });
  },

  clear: () => set({
    strokes: [],
    currentStroke: null,
    undoStack: [],
    redoStack: [],
  }),
}));

const useWhiteboard = (roomId: string) => {
  const socket = useWebSocket(roomId, '');
  const store = useWhiteboardStore();

  useEffect(() => {
    if (!socket) return;

    const handleStrokeAdded = (stroke: Stroke) => {
      console.log('Received stroke:', stroke);
      store.addStroke(stroke);
    };

    socket.on('stroke_added', handleStrokeAdded);
    socket.on('strokes_cleared', store.clear);

    return () => {
      socket.off('stroke_added', handleStrokeAdded);
      socket.off('strokes_cleared');
    };
  }, [socket, store]);

  const startStroke = (point: Point) => {
    const stroke = store.startStroke(point);
    if (stroke && socket) {
      socket.emit('stroke_added', stroke);
    }
  };

  const updateStroke = (point: Point) => {
    const updatedStroke = store.updateStroke(point);
    if (updatedStroke && socket) {
      socket.emit('stroke_updated', updatedStroke);
    }
  };

  const endStroke = () => {
    const completedStroke = store.endStroke();
    if (completedStroke && socket) {
      socket.emit('stroke_completed', completedStroke);
    }
  };

  return {
    strokes: store.strokes,
    tool: store.tool,
    color: store.color,
    strokeWidth: store.strokeWidth,
    canUndo: store.strokes.length > 0,
    canRedo: store.undoStack.length > 0,
    setTool: store.setTool,
    setColor: store.setColor,
    setStrokeWidth: store.setStrokeWidth,
    startStroke,
    updateStroke,
    endStroke,
    undo: store.undo,
    redo: store.redo,
    clear: store.clear,
  };
};

export default useWhiteboard;