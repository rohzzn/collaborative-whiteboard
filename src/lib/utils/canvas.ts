// src/lib/utils/canvas.ts

import { Point } from '@/types'; // Import Point type

export function getSvgPathFromStroke(stroke: Point[]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, point, i, arr) => {
      const nextPoint = arr[i + 1];
      if (!nextPoint) return acc;
      acc.push(point.x, point.y, (point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2);
      return acc;
    },
    ['M', stroke[0].x, stroke[0].y, 'Q']
  );

  d.push('Z');
  return d.join(' ');
}
