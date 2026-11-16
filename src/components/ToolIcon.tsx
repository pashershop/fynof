import React from 'react';
import {
  Code2,
  Crop,
  Droplets,
  FileText,
  IdCard,
  Images,
  LayoutGrid,
  Minimize2,
  PenTool,
  RefreshCw,
  RotateCw,
  Scaling,
  SlidersHorizontal,
  Stamp,
  UserSquare2,
  Wrench,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Minimize2,
  Scaling,
  RefreshCw,
  Crop,
  UserSquare2,
  FileText,
  Images,
  PenTool,
  IdCard,
  LayoutGrid,
  RotateCw,
  Stamp,
  Droplets,
  SlidersHorizontal,
  Code2,
};

export const ToolIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const Icon = ICON_MAP[name] || Wrench;
  return <Icon className={className} aria-hidden="true" />;
};
