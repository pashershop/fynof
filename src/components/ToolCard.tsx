import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/tools';
import { ToolDefinition } from '../types/tool';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: ToolDefinition;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { lang } = useApp();
  const cat = CATEGORIES.find((c) => c.id === tool.category);

  return (
    <Link
      to={`/${tool.slug}`}
      className="group flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-600/50 hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-150 shrink-0">
            <ToolIcon name={tool.iconName} className="w-5 h-5" />
          </div>
          <ArrowUpRight
            className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0"
            aria-hidden="true"
          />
        </div>

        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {tool.name[lang]}
        </h3>

        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed line-clamp-2">
          {tool.shortDesc[lang]}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <span>{cat ? cat.name[lang] : tool.category}</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono text-[11px] truncate">{tool.formatsLabel}</span>
      </div>
    </Link>
  );
};
