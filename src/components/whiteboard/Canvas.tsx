// src/components/whiteboard/Canvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// Define types
type DrawingTool = 'pencil' | 'rectangle' | 'circle' | 'text' | 'arrow' | 'eraser';

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface CanvasProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  onStrokeStart?: (point: Point) => void;
  onStrokeUpdate?: (point: Point) => void;
  onStrokeComplete?: (points: Point[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  tool,
  color,
  strokeWidth,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setContext(ctx);
    
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Reset context properties after resize
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [color, strokeWidth]);

  // Update context properties when they change
  useEffect(() => {
    if (!context) return;
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
  }, [context, color, strokeWidth]);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not initialized');

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: 0.5,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;

    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentPoints([point]);
    
    context.beginPath();
    context.moveTo(point.x, point.y);
    
    onStrokeStart?.(point);
  }, [context, getCanvasPoint, onStrokeStart]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const point = getCanvasPoint(e);
    setCurrentPoints(prev => [...prev, point]);
    
    switch (tool) {
      case 'pencil':
      case 'eraser':
        context.lineTo(point.x, point.y);
        context.stroke();
        break;
        
      case 'rectangle':
        // Clear and redraw for shape preview
        const startPoint = currentPoints[0];
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.beginPath();
        context.rect(
          startPoint.x,
          startPoint.y,
          point.x - startPoint.x,
          point.y - startPoint.y
        );
        context.stroke();
        break;
        
      case 'circle':
        const center = currentPoints[0];
        const radius = Math.sqrt(
          Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
        );
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, Math.PI * 2);
        context.stroke();
        break;
    }
    
    onStrokeUpdate?.(point);
  }, [isDrawing, context, tool, currentPoints, getCanvasPoint, onStrokeUpdate]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPoints.length > 0) {
      onStrokeComplete?.(currentPoints);
    }
    setCurrentPoints([]);

    if (context) {
      context.closePath();
    }
  }, [isDrawing, currentPoints, context, onStrokeComplete]);

  return (
    <motion.div 
      className="relative w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </motion.div>
  );
};

export default Canvas;