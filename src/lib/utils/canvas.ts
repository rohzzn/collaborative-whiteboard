// src/lib/utils/canvas.ts

// Helper function to convert perfect-freehand points to SVG path
export function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) return '';

  const d = points.reduce(
    (acc, [x0, y0], i, arr) => {
      if (i === 0) return `M ${x0},${y0}`;
      
      const [x1, y1] = arr[(i + 1) % arr.length];
      const [x2, y2] = arr[(i + 2) % arr.length];
      
      if (i === arr.length - 1) {
        return `${acc} L ${x1},${y1}`;
      }
      
      return `${acc} L ${x1},${y1} Q ${x2},${y2}`;
    },
    ''
  );

  return `${d} Z`;
}