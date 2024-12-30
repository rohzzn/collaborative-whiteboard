import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pencil, Square, Circle, Type, 
  ArrowRight, Eraser, Undo, Redo,
  Download, Share2, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';

interface ToolbarProps {
  tool: string;
  color: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onShare: () => void;
}

const tools = [
  { id: 'pencil', icon: Pencil, label: 'Pencil (P)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow (A)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
];

export const Toolbar = ({
  tool,
  color,
  strokeWidth,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onExport,
  onShare,
}: ToolbarProps) => {
  return (
    <motion.div
      className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Drawing Tools */}
      <div className="flex items-center gap-1">
        {tools.map(({ id, icon: Icon, label }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant={tool === id ? 'default' : 'ghost'}
                size="icon"
                className="w-9 h-9"
                onClick={() => onToolChange(id)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Color Picker */}
      <ColorPicker
        color={color}
        onChange={onColorChange}
      />

      {/* Stroke Width */}
      <input
        type="range"
        min="1"
        max="20"
        value={strokeWidth}
        onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
        className="w-24"
      />

      <Separator orientation="vertical" className="h-8" />

      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9"
            >
              <Users className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Participants</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
};

export default Toolbar;