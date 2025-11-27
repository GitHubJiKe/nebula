import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import Editor from 'react-simple-code-editor';
import { Search, X, ArrowUp, ArrowDown, Replace, ReplaceAll, Type } from 'lucide-react';

// Access global Prism object from window (loaded via CDN in index.html)
declare const Prism: any;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  showSearch: boolean;
  onCloseSearch: () => void;
}

const CodeEditor: React.FC<EditorProps> = ({ value, onChange, showSearch, onCloseSearch }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Shortcut for Ctrl+F handling to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F logic handled in App.tsx to toggle state, but we ensure if search is open, Esc closes it.
      if (e.key === 'Escape' && showSearch) {
        onCloseSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, onCloseSearch]);

  // Find matches when findText or value changes
  useEffect(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const indices: number[] = [];
    let match;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); // Escape regex special chars
      while ((match = regex.exec(value)) !== null) {
        indices.push(match.index);
      }
    } catch(e) { /* ignore invalid regex while typing */ }
    
    setMatches(indices);
    // If we had a selection, try to keep near it, otherwise reset
    if (indices.length > 0) {
       // simple logic: keep current index if valid
       setCurrentMatchIndex(prev => (prev >= 0 && prev < indices.length) ? prev : 0);
    } else {
       setCurrentMatchIndex(-1);
    }

  }, [findText, value]);

  const highlight = (code: string) => {
    // Safety check for Prism and Markdown language support
    if (typeof Prism !== 'undefined' && Prism.languages.markdown) {
      return Prism.highlight(code, Prism.languages.markdown, 'markdown');
    }
    return code;
  };

  const getTextarea = () => {
    // Helper to grab the textarea from the library
    return containerRef.current?.querySelector('.npm__react-simple-code-editor__textarea') as HTMLTextAreaElement | null;
  };

  const selectMatch = (index: number) => {
    if (index < 0 || index >= matches.length) return;
    const start = matches[index];
    const end = start + findText.length;
    
    const textarea = getTextarea();
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(start, end);
      
      // Attempt to scroll into view - native textarea scroll behavior
      // A more complex implementation would calculate line heights
      const lines = value.substring(0, start).split('\n').length;
      const lineHeight = 21; // approx
      // textarea.scrollTop = lines * lineHeight - 100; 
    }
  };

  const handleNext = () => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    selectMatch(nextIndex);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIndex);
    selectMatch(prevIndex);
  };

  const handleReplace = () => {
    if (matches.length === 0 || currentMatchIndex === -1) return;
    
    const start = matches[currentMatchIndex];
    const end = start + findText.length;
    const newValue = value.substring(0, start) + replaceText + value.substring(end);
    
    onChange(newValue);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newValue = value.replace(regex, replaceText);
    onChange(newValue);
  };

  const applyFormat = (type: 'bold' | 'italic' | 'link' | 'codeblock' | 'list') => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let newCursorStart = start;
    let newCursorEnd = end;

    switch (type) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
        newCursorStart = start + 2;
        newCursorEnd = end + 2;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = end + 1;
        break;
      case 'link':
        newText = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = start + 1 + selectedText.length; // Select the text part
        break;
      case 'codeblock':
        newText = value.substring(0, start) + "\n```\n" + selectedText + "\n```\n" + value.substring(end);
        newCursorStart = start + 5; 
        newCursorEnd = start + 5 + selectedText.length;
        break;
       case 'list':
         // If already list, maybe remove? For now just append '- '
         const lines = selectedText.split('\n');
         const listed = lines.map(l => `- ${l}`).join('\n');
         newText = value.substring(0, start) + listed + value.substring(end);
         newCursorStart = start;
         newCursorEnd = start + listed.length;
         break;
    }
    
    onChange(newText);
    
    // Defer selection restore to allow render
    setTimeout(() => {
        const t = getTextarea();
        if(t) {
            t.focus();
            t.setSelectionRange(newCursorStart, newCursorEnd);
        }
    }, 0);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent | KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod) {
          switch(e.key.toLowerCase()) {
              case 'b':
                  e.preventDefault();
                  applyFormat('bold');
                  break;
              case 'i':
                  e.preventDefault();
                  applyFormat('italic');
                  break;
              case 'k':
                  e.preventDefault();
                  applyFormat('link');
                  break;
              case 'l':
                  // List
                  e.preventDefault();
                  applyFormat('list');
                  break;
          }
          
          if (e.shiftKey && e.key.toLowerCase() === 'c') {
              e.preventDefault();
              applyFormat('codeblock');
          }
      }
  };

  return (
    <div className="h-full w-full bg-dark-bg relative flex flex-col" ref={containerRef}>
      <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center px-4 text-xs text-slate-500 select-none shrink-0 z-10 justify-between">
        <span>MARKDOWN INPUT</span>
        <span className="text-[10px] opacity-50 hidden sm:block">CMD+B(BOLD) CMD+I(ITALIC) CMD+K(LINK)</span>
      </div>

      {/* Search Panel Overlay */}
      {showSearch && (
        <div className="absolute top-8 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-slate-700/50">
           
           {/* Header */}
           <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Search size={12} /> Find & Replace
              </span>
              <button onClick={onCloseSearch} className="text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
           </div>

           <div className="p-3 flex flex-col gap-3">
              {/* Find Input */}
              <div className="relative group">
                 <input 
                   autoFocus
                   type="text" 
                   value={findText}
                   onChange={(e) => setFindText(e.target.value)}
                   placeholder="Find..." 
                   className="w-full bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-md px-3 py-1.5 pl-8 focus:outline-none focus:border-tech-500 transition-colors placeholder:text-slate-600"
                   onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                 />
                 <Search size={14} className="absolute left-2.5 top-2 text-slate-500 group-focus-within:text-tech-400" />
                 
                 {matches.length > 0 && (
                   <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">
                     {currentMatchIndex + 1}/{matches.length}
                   </span>
                 )}
              </div>

              {/* Replace Input */}
              <div className="relative group">
                 <input 
                   type="text" 
                   value={replaceText}
                   onChange={(e) => setReplaceText(e.target.value)}
                   placeholder="Replace with..." 
                   className="w-full bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-md px-3 py-1.5 pl-8 focus:outline-none focus:border-tech-500 transition-colors placeholder:text-slate-600"
                   onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
                 />
                 <Type size={14} className="absolute left-2.5 top-2 text-slate-500 group-focus-within:text-tech-400" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-2 mt-1">
                 <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded" title="Previous Match">
                       <ArrowUp size={14} />
                    </button>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <button onClick={handleNext} className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded" title="Next Match">
                       <ArrowDown size={14} />
                    </button>
                 </div>

                 <div className="flex items-center gap-2">
                    <button onClick={handleReplace} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded transition-colors" title="Replace Current">
                       Replace
                    </button>
                    <button onClick={handleReplaceAll} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded transition-colors" title="Replace All">
                       All
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          padding={24}
          onKeyDown={handleEditorKeyDown}
          className="font-mono text-sm leading-relaxed"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            backgroundColor: 'transparent',
            minHeight: '100%',
            color: '#e2e8f0', // slate-200 to match theme
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;