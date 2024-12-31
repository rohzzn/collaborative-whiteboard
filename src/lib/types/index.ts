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

// src/lib/constants/index.ts
export const DEFAULT_COLOR = '#000000';
export const DEFAULT_STROKE_WIDTH = 2;

// src/hooks/useUser.ts
import { create } from 'zustand';

interface UserState {
  name: string;
  setName: (name: string) => void;
}

const useUser = create<UserState>((set) => ({
  name: '',
  setName: (name) => set({ name }),
}));

export default useUser;

