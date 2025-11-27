import React from 'react';
import { 
  Download, Eye, Code, Columns, Wand2, 
  Bot, FileText, ChevronDown, Check, Loader2, Share2, Image as ImageIcon, Search
} from 'lucide-react';
import { EditorMode, AIAction } from '../types';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ToolbarProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  onExport: (type: 'md' | 'png') => void;
  onAIAction: (action: AIAction) => void;
  isGenerating: boolean;
  showSearch: boolean;
  onToggleSearch: () => void;
  showAiMenu: boolean;
  setShowAiMenu: (show: boolean) => void;
  showExportMenu: boolean;
  setShowExportMenu: (show: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, setMode, onExport, onAIAction, isGenerating, showSearch, onToggleSearch,
  showAiMenu, setShowAiMenu, showExportMenu, setShowExportMenu
}) => {

  const toggleAiMenu = () => {
    setShowAiMenu(!showAiMenu);
    setShowExportMenu(false);
  }
  const toggleExportMenu = () => {
    setShowExportMenu(!showExportMenu);
    setShowAiMenu(false);
  }

  const handleAiAction = (action: AIAction) => {
    onAIAction(action);
    setShowAiMenu(false);
  };

  const handleExport = (type: 'md' | 'png') => {
    onExport(type);
    setShowExportMenu(false);
  }

  return (
    <div className="h-14 bg-dark-bg border-b border-dark-border flex items-center justify-between px-4 select-none z-50">
      
      {/* Left: Branding */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-tech-500 to-tech-700 rounded-md flex items-center justify-center shadow-lg shadow-tech-500/20">
            <span className="font-mono text-white font-bold text-lg">{`{}`}</span>
        </div>
        <span className="font-bold text-slate-100 tracking-tight hidden sm:block">
          Nebula<span className="text-tech-400">MD</span>
        </span>
      </div>

      {/* Center: View Toggles */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
        <div className="relative group">
          <button
            onClick={() => setMode(EditorMode.EDIT)}
            className={`p-2 rounded-md transition-all ${mode === EditorMode.EDIT ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            title="Editor Only (Cmd+Shift+E)"
          >
            <Code size={18} />
          </button>
        </div>
        <div className="relative group">
          <button
            onClick={() => setMode(EditorMode.SPLIT)}
            className={`p-2 rounded-md transition-all ${mode === EditorMode.SPLIT ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            title="Split View (Cmd+Shift+S)"
          >
            <Columns size={18} />
          </button>
        </div>
        <div className="relative group">
          <button
            onClick={() => setMode(EditorMode.PREVIEW)}
            className={`p-2 rounded-md transition-all ${mode === EditorMode.PREVIEW ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            title="Preview Only (Cmd+Shift+P)"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        
        <button
          onClick={onToggleSearch}
          className={`p-2 rounded-full transition-colors ${showSearch ? 'bg-tech-500/20 text-tech-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Find & Replace (Cmd+F)"
        >
          <Search size={18} />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1"></div>
        
        {/* AI Dropdown */}
        <div className="relative">
          <button 
            onClick={toggleAiMenu}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-tech-500/30 bg-tech-500/10 text-tech-400 text-sm font-medium hover:bg-tech-500/20 transition-colors ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
            title="AI Tools (Cmd+Space)"
          >
             {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
             <span className="hidden sm:inline">AI Assist</span>
             <ChevronDown size={14} />
          </button>

          {showAiMenu && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                        Generative Tools
                    </div>
                    <button onClick={() => handleAiAction(AIAction.TECH_POLISH)} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-tech-300 flex items-center gap-2">
                        <Wand2 size={14} /> Polish (Tech Style)
                    </button>
                    <button onClick={() => handleAiAction(AIAction.FIX_GRAMMAR)} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-tech-300 flex items-center gap-2">
                        <Check size={14} /> Fix Grammar
                    </button>
                    <button onClick={() => handleAiAction(AIAction.SUMMARIZE)} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-tech-300 flex items-center gap-2">
                        <FileText size={14} /> Summarize
                    </button>
                </div>
            </>
          )}
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={toggleExportMenu}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-900 rounded-full text-sm font-bold hover:bg-white transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={14} />
          </button>
          
          {showExportMenu && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                        Export Options
                    </div>
                    <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-tech-300 flex items-center gap-2">
                        <FileText size={14} /> Markdown (.md)
                    </button>
                    <button onClick={() => handleExport('png')} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-tech-300 flex items-center gap-2">
                        <ImageIcon size={14} /> Image (.png)
                    </button>
                </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Toolbar;