// src/types/index.ts

export interface Point {
    x: number;
    y: number;
    pressure?: number;
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
    type: 'stroke_added' | 'stroke_updated' | 'stroke_deleted' | 'user_joined' | 'user_left' | 'canvas_cleared';
    payload: Stroke | User | { strokeId: string } | null;
    userId: string;
    timestamp: Date;
  };
  