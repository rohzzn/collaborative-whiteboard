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
 startStroke: (point: Point) => Stroke;
 updateStroke: (point: Point) => Stroke | null;
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
   const newStroke: Stroke = {
     id: uuidv4(),
     type: tool === 'eraser' ? 'eraser' : tool,
     points: [point],
     color: tool === 'eraser' ? '#FFFFFF' : color,
     width: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
   };
   set({ currentStroke: newStroke, isDrawing: true });
   return newStroke;
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

   const completedStroke = { ...currentStroke };
   set({
     strokes: [...strokes, completedStroke],
     currentStroke: null,
     isDrawing: false,
     undoStack: [],
     redoStack: [],
   });

   return completedStroke;
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

   socket.on('stroke_started', (stroke: Stroke) => {
     console.log('Received stroke:', stroke);
   });

   socket.on('stroke_updated', (stroke: Stroke) => {
     console.log('Updating stroke:', stroke);
   });

   socket.on('stroke_completed', (stroke: Stroke) => {
     console.log('Stroke completed:', stroke);
     store.addStroke(stroke);
   });

   socket.on('canvas_cleared', store.clear);

   return () => {
     socket.off('stroke_started');
     socket.off('stroke_updated');
     socket.off('stroke_completed');
     socket.off('canvas_cleared');
   };
 }, [socket, store]);

 const startStroke = (point: Point) => {
   const stroke = store.startStroke(point);
   if (socket) {
     socket.emit('stroke_started', stroke);
   }
   return stroke;
 };

 const updateStroke = (point: Point) => {
   const updatedStroke = store.updateStroke(point);
   if (socket && updatedStroke) {
     socket.emit('stroke_updated', updatedStroke);
   }
 };

 const endStroke = () => {
   const completedStroke = store.endStroke();
   if (socket && completedStroke) {
     socket.emit('stroke_completed', completedStroke);
   }
   return completedStroke;
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