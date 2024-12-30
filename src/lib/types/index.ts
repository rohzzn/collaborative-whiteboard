// src/lib/types/index.ts

export type Point = {
    x: number;
    y: number;
    pressure?: number;
  };
  
  export type DrawingTool = 
    | 'pencil'
    | 'rectangle'
    | 'circle'
    | 'text'
    | 'arrow'
    | 'eraser';
  
  export type Stroke = {
    id: string;
    type: DrawingTool;
    points: Point[];
    color: string;
    width: number;
    text?: string;
  };
  
  export type User = {
    id: string;
    name: string;
    color: string;
    isActive: boolean;
    lastSeen: Date;
  };
  
  export type Room = {
    id: string;
    name: string;
    users: User[];
    strokes: Stroke[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type RoomEvent = {
    type: 'stroke_added' | 'stroke_updated' | 'stroke_deleted' | 'user_joined' | 'user_left' | 'canvas_cleared';
    payload: Stroke | User | { strokeId: string } | null;
    userId: string;
    timestamp: Date;
  };