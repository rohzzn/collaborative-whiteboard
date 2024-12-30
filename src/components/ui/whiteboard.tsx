import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from '@/lib/utils/canvas';

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface CanvasProps {
  tool: string;
  color: string;
  strokeWidth: number;
  onStrokeComplete?: (points: Point[]) => void;
}

export const Canvas = ({ 
  tool, 
  color, 
  strokeWidth, 
  onStrokeComplete 
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle window resize
    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [color, strokeWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: 0.5,
    };

    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: 0.5,
    };

    setCurrentPoints(prev => [...prev, point]);

    // Get stroke outline
    const outline = getStroke(currentPoints, {
      size: strokeWidth,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    // Convert to SVG path
    const pathData = getSvgPathFromStroke(outline);
    setCurrentPath(pathData);

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fill(new Path2D(pathData));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    onStrokeComplete?.(currentPoints);
    setCurrentPoints([]);
    setCurrentPath(null);
  };

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
      {currentPath && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d={currentPath}
            fill={color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.div>
  );
};

export default Canvas;