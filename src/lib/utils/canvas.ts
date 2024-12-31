// src/lib/utils/canvas.ts

import { Point } from '@/lib/types';

export function getSvgPathFromStroke(stroke: Point[]): string {
  if (!stroke.length) return '';

  const points = stroke.map(point => [point.x, point.y] as [number, number]);

  const d = points.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...points[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}
