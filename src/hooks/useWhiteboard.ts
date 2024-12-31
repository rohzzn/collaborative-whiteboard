// src/hooks/useWhiteboard.ts

import { useEffect } from 'react';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DrawingTool, Stroke, Point } from '@/lib/types';
import { TOOL_SHORTCUTS, DEFAULT_COLOR, DEFAULT_STROKE_WIDTH } from '@/lib/constants';
import { useWebSocket } from '@/hooks/useWebSocket';

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

interface WhiteboardActions {
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  startStroke: (point: Point) => void;
  updateStroke: (point: Point) => void;
  endStroke: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

type WhiteboardStore = WhiteboardState & WhiteboardActions;

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
    const newStroke: Stroke = {
      id: uuidv4(),
      type: tool,
      points: [point],
      color,
      width: strokeWidth,
    };
    set({ currentStroke: newStroke, isDrawing: true });
  },

  updateStroke: (point) => {
    const { currentStroke, isDrawing } = get();
    if (!isDrawing || !currentStroke) return;

    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    set({ currentStroke: updatedStroke });
  },

  endStroke: () => {
    const { currentStroke, strokes } = get();
    if (!currentStroke) return;

    set({
      strokes: [...strokes, currentStroke],
      currentStroke: null,
      isDrawing: false,
      undoStack: [...get().undoStack, currentStroke],
      redoStack: [],
    });
  },

  undo: () => {
    const { strokes, undoStack } = get();
    if (strokes.length === 0) return;

    const lastStroke = strokes[strokes.length - 1];
    set({
      strokes: strokes.slice(0, -1),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, lastStroke],
    });
  },

  redo: () => {
    const { strokes, redoStack } = get();
    if (redoStack.length === 0) return;

    const strokeToRedo = redoStack[redoStack.length - 1];
    set({
      strokes: [...strokes, strokeToRedo],
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, strokeToRedo],
    });
  },

  clear: () =>
    set({
      strokes: [],
      currentStroke: null,
      undoStack: [],
      redoStack: [],
    }),
}));

interface UseWhiteboardReturn {
  strokes: Stroke[];
  startStroke: (point: Point) => void;
  updateStroke: (point: Point) => void;
  endStroke: () => void;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useWhiteboard = (roomId: string): UseWhiteboardReturn => {
  const socket = useWebSocket(roomId);
  const store = useWhiteboardStore();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            store.redo();
          } else {
            store.undo();
          }
        }
      } else {
        const tool = TOOL_SHORTCUTS[e.key.toLowerCase() as keyof typeof TOOL_SHORTCUTS];
        if (tool) {
          store.setTool(tool);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  // Sync with other users
  useEffect(() => {
    if (!socket) {
      // Socket is still initializing; do not log an error here.
      return;
    }

    const handleStrokeAdded = (stroke: Stroke) => {
      store.setStrokeWidth(stroke.width);
      store.setColor(stroke.color);
      store.setTool(stroke.type);
      store.startStroke(stroke.points[0]);
      stroke.points.slice(1).forEach((point) => {
        store.updateStroke(point);
      });
      store.endStroke();
    };

    const handleConnectError = (error: Error) => {
      console.error('WebSocket connection error:', error);
      // Optionally, set an error state here to inform the user.
    };

    socket.on('stroke_added', handleStrokeAdded);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('stroke_added', handleStrokeAdded);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, store]);

  return {
    strokes: store.strokes,
    startStroke: store.startStroke,
    updateStroke: store.updateStroke,
    endStroke: store.endStroke,
    tool: store.tool,
    color: store.color,
    strokeWidth: store.strokeWidth,
    canUndo: store.strokes.length > 0,
    canRedo: store.redoStack.length > 0,
    setTool: store.setTool,
    setColor: store.setColor,
    setStrokeWidth: store.setStrokeWidth,
    undo: store.undo,
    redo: store.redo,
    clear: store.clear,
  };
};

export default useWhiteboard;
