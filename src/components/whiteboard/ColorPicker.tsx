import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLORS = [
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
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 border-2"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className={cn(
                'w-8 h-8 rounded-full border-2 border-muted',
                color === c && 'border-primary'
              )}
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
            >
              <span className="sr-only">Pick {c}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;