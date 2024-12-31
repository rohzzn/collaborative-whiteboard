// src/components/whiteboard/Canvas.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { DrawingTool, Point, Stroke } from '@/types';

interface Props {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  strokes: Stroke[];
  onStrokeStart: (point: Point) => void;
  onStrokeUpdate: (point: Point) => void;
  onStrokeComplete: () => void;
}

const Canvas = ({
  tool,
  color,
  strokeWidth,
  strokes,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeComplete,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      drawStrokes(ctx);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawStrokes(ctx);
  }, [strokes]);

  const drawStrokes = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.type === 'rectangle') {
        const [start, end] = stroke.points;
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.strokeRect(start.x, start.y, width, height);
      } else if (stroke.type === 'circle') {
        const [start, end] = stroke.points;
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (stroke.type === 'arrow') {
        const [start, end] = stroke.points;
        drawArrow(ctx, start, end, stroke.color, stroke.width);
      } else if (stroke.type === 'text' && stroke.text) {
        const [pos] = stroke.points;
        ctx.font = `${stroke.width * 8}px Arial`;
        ctx.fillStyle = stroke.color;
        ctx.fillText(stroke.text, pos.x, pos.y);
      } else {
        // Default pencil/eraser stroke
        const [first, ...rest] = stroke.points;
        ctx.moveTo(first.x, first.y);
        rest.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      }
    });
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    color: string,
    width: number
  ) => {
    const headLen = 20
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLen * Math.cos(angle - Math.PI / 6),
      end.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLen * Math.cos(angle + Math.PI / 6),
      end.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getPoint(e);
    setIsDrawing(true);
    setStartPoint(point);
    
    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        onStrokeStart({ ...point, text });
        onStrokeComplete();
      }
    } else {
      onStrokeStart(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const currentPoint = getPoint(e);
    if (tool === 'rectangle' || tool === 'circle' || tool === 'arrow') {
      // For shapes, we only need the start and current point
      onStrokeUpdate(currentPoint);
    } else {
      // For freehand drawing, add the point to the stroke
      onStrokeUpdate(currentPoint);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPoint(null);
    onStrokeComplete();
  };

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none bg-white"
        style={{ cursor: tool === 'text' ? 'text' : 'crosshair' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </motion.div>
  );
};

export default Canvas;