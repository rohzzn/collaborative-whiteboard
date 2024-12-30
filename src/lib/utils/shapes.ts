// src/lib/utils/shapes.ts

import { type Point } from '@/lib/types';

const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const calculateCenter = (points: Point[]): Point => {
  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );
  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
};

const calculateBoundingBox = (points: Point[]) => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY };
};

export const detectShape = (points: Point[]): 'rectangle' | 'circle' | null => {
  if (points.length < 10) return null;

  const { minX, maxX, minY, maxY } = calculateBoundingBox(points);
  const width = maxX - minX;
  const height = maxY - minY;
  const center = calculateCenter(points);

  // Check if it's a circle
  const radius = width / 2;
  const isCircle = points.every((point) => {
    const distance = calculateDistance(point, center);
    return Math.abs(distance - radius) < radius * 0.2;
  });

  if (isCircle) return 'circle';

  // Check if it's a rectangle
  const aspectRatio = width / height;
  const isRectangle =
    points.every(
      (point) =>
        Math.abs(point.x - minX) < 10 ||
        Math.abs(point.x - maxX) < 10 ||
        Math.abs(point.y - minY) < 10 ||
        Math.abs(point.y - maxY) < 10
    ) && aspectRatio > 1.2;

  if (isRectangle) return 'rectangle';

  return null;
};

export const scalePoints = (
  points: Point[],
  scale: number,
  origin: Point = { x: 0, y: 0 }
): Point[] => {
  return points.map((point) => ({
    x: (point.x - origin.x) * scale + origin.x,
    y: (point.y - origin.y) * scale + origin.y,
    pressure: point.pressure,
  }));
};

export const rotatePoints = (
  points: Point[],
  angle: number,
  origin: Point = { x: 0, y: 0 }
): Point[] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return points.map((point) => {
    const x = point.x - origin.x;
    const y = point.y - origin.y;
    return {
      x: x * cos - y * sin + origin.x,
      y: x * sin + y * cos + origin.y,
      pressure: point.pressure,
    };
  });
};