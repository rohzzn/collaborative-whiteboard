// src/components/whiteboard/Canvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { DrawingTool, Point, Stroke } from '@/types';

interface CanvasProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  strokes: Stroke[];
  onStrokeStart?: (point: Point) => void;
  onStrokeUpdate?: (point: Point) => void;
  onStrokeComplete?: (points: Point[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  tool,
  color,
  strokeWidth,
  strokes,
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

      // Redraw all strokes
      drawStrokes(ctx, strokes);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [color, strokeWidth, strokes]);

  // Update context properties when they change
  useEffect(() => {
    if (!context) return;
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
  }, [context, color, strokeWidth]);

  // Draw all strokes when they change
  useEffect(() => {
    if (!context) return;
    drawStrokes(context, strokes);
  }, [strokes]);

  const drawStrokes = (ctx: CanvasRenderingContext2D, strokesToDraw: Stroke[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    strokesToDraw.forEach(stroke => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      
      const points = stroke.points;
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      }
    });
  };

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
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentPoints([point]);
    onStrokeStart?.(point);
  }, [getCanvasPoint, onStrokeStart]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const point = getCanvasPoint(e);
    setCurrentPoints(prev => [...prev, point]);
    
    // Draw current stroke
    context.beginPath();
    context.moveTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
    context.lineTo(point.x, point.y);
    context.stroke();
    
    onStrokeUpdate?.(point);
  }, [isDrawing, context, currentPoints, getCanvasPoint, onStrokeUpdate]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPoints.length > 0) {
      onStrokeComplete?.(currentPoints);
    }
    setCurrentPoints([]);
  }, [isDrawing, currentPoints, onStrokeComplete]);

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