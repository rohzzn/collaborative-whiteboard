// src/lib/constants/index.ts

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;
export const DEFAULT_STROKE_WIDTH = 2;
export const ERASER_WIDTH = 20;
export const DEFAULT_COLOR = '#000000';

export const TOOL_SHORTCUTS = {
  'p': 'pencil',
  'r': 'rectangle',
  'c': 'circle',
  't': 'text',
  'a': 'arrow',
  'e': 'eraser',
} as const;

export const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
] as const;

export const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 24] as const;

// src/lib/constants/index.ts

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  STROKE_ADDED: 'stroke_added',
  STROKE_UPDATED: 'stroke_updated',
  STROKE_DELETED: 'stroke_deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  CANVAS_CLEARED: 'canvas_cleared',
  ROOM_STATE: 'room_state',
} as const;
