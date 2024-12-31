// src/types/index.ts

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  text?: string;
}

export type DrawingTool = 'pencil' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'eraser';

export interface Stroke {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  width: number;
  text?: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  lastSeen: Date;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  strokes: Stroke[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoomEvent = {
  type: 'stroke_started' | 'stroke_updated' | 'stroke_completed' | 'user_joined' | 'user_left' | 'canvas_cleared';
  payload: Stroke | User | { strokeId: string } | null;
  userId: string;
  timestamp: Date;
}

export interface SocketEvents {
  room_state: (room: Room) => void;
  stroke_started: (stroke: Stroke) => void;
  stroke_updated: (stroke: Stroke) => void;
  stroke_completed: (stroke: Stroke) => void;
  user_joined: (user: User) => void;
  user_left: (userId: string) => void;
  canvas_cleared: () => void;
}

export interface SocketEmits {
  stroke_started: (stroke: Stroke) => void;
  stroke_updated: (stroke: Stroke) => void;
  stroke_completed: (stroke: Stroke) => void;
  clear_canvas: () => void;
}

export interface WhiteboardState {
  strokes: Stroke[];
  currentStroke: Stroke | null;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
}

export interface WhiteboardStore extends WhiteboardState {
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  startStroke: (point: Point) => void;
  updateStroke: (point: Point) => void;
  endStroke: () => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

export interface UserState {
  name: string;
  setName: (name: string) => void;
}

export type Position = {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DrawOptions {
  strokeWidth: number;
  color: string;
  fill?: boolean;
}

export type StrokeStyle = {
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
  dash?: number[];
}

export interface ShapeProps {
  position: Position;
  size: Size;
  options: DrawOptions;
  style?: StrokeStyle;
}

export interface TextProps extends Omit<ShapeProps, 'size'> {
  text: string;
  fontSize: number;
  fontFamily: string;
}