import React, { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { EditorMode, AIAction } from './types';
import { generateAIResponse } from './services/geminiService';

const DEFAULT_MARKDOWN = `# Welcome to Nebula MD

Nebula is a specialized markdown editor for tech professionals.

## Features
- **Split View**: Edit and preview in real-time.
- **Tech Syntax**: Highlighting for code.
- **Charts**: Embed charts directly using JSON.
- **AI Assist**: Powered by Gemini.

### 1. Data Visualization

#### Bar Chart (Deployments)
\`\`\`chart
{
  "type": "bar",
  "title": "Monthly Deployments vs Bugs",
  "xKey": "month",
  "data": [
    {"month": "Jan", "deployments": 12, "bugs": 2},
    {"month": "Feb", "deployments": 19, "bugs": 4},
    {"month": "Mar", "deployments": 35, "bugs": 1}
  ],
  "series": [
    {"key": "deployments", "color": "#0ea5e9"},
    {"key": "bugs", "color": "#ef4444"}
  ]
}
\`\`\`

#### Line Chart (Traffic Trend)
\`\`\`chart
{
  "type": "line",
  "title": "API Traffic (Requests/sec)",
  "xKey": "time",
  "data": [
    {"time": "10:00", "requests": 1200},
    {"time": "11:00", "requests": 1900},
    {"time": "12:00", "requests": 3500},
    {"time": "13:00", "requests": 2800},
    {"time": "14:00", "requests": 1500}
  ],
  "series": [
    {"key": "requests", "color": "#22c55e"}
  ]
}
\`\`\`

#### Pie Chart (Infrastructure)
\`\`\`chart
{
  "type": "pie",
  "title": "Cost Distribution",
  "xKey": "service",
  "data": [
    {"service": "Compute", "cost": 45},
    {"service": "Storage", "cost": 25},
    {"service": "Network", "cost": 20},
    {"service": "Other", "cost": 10}
  ],
  "series": [
    {"key": "cost", "color": "auto"}
  ]
}
\`\`\`

### 2. Live Metrics (D3)

Use the \`viz\` block for gauges and progress indicators.

#### System Load
\`\`\`viz
{
  "type": "gauge",
  "value": 78,
  "label": "CPU Load",
  "color": "#ef4444"
}
\`\`\`

#### Disk Usage
\`\`\`viz
{
  "type": "progress",
  "value": 42,
  "label": "Disk Space",
  "color": "#3b82f6"
}
\`\`\`

### 3. Terminal Output
\`\`\`terminal
npm install nebula-md
npm run build
> Build successful in 402ms
\`\`\`
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [mode, setMode] = useState<EditorMode>(EditorMode.SPLIT);
  const [showSearch, setShowSearch] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  
  // Menu states lifted from Toolbar
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Persist to local storage
  useEffect(() => {
    const saved = localStorage.getItem('nebula-content');
    if (saved) setMarkdown(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('nebula-content', markdown);
  }, [markdown]);

  const handleExport = async (type: 'md' | 'png') => {
    if (type === 'md') {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMsg('Document exported successfully.');
      setTimeout(() => setStatusMsg(''), 3000);
    } else if (type === 'png') {
       // Check if preview is visible logic implicitly handled by checking DOM presence
       const element = document.getElementById('preview-content');
       if (!element) {
         setStatusMsg('Error: Switch to Preview mode to export image.');
         setTimeout(() => setStatusMsg(''), 3000);
         return;
       }
       
       setStatusMsg('Generating image...');
       try {
         const canvas = await html2canvas(element, {
            useCORS: true,
            backgroundColor: '#0f172a', // Match bg-dark-bg
            scale: 2 // Retain high quality
         });
         
         const image = canvas.toDataURL("image/png");
         const link = document.createElement('a');
         link.href = image;
         link.download = 'nebula-preview.png';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setStatusMsg('Image exported successfully.');
       } catch (error) {
         console.error(error);
         setStatusMsg('Failed to generate image.');
       } finally {
         setTimeout(() => setStatusMsg(''), 3000);
       }
    }
  };

  const handleAIAction = async (action: AIAction) => {
    setIsGenerating(true);
    setStatusMsg('AI is thinking...');
    try {
      const result = await generateAIResponse(markdown, action);
      
      if (action === AIAction.SUMMARIZE) {
         setMarkdown(prev => prev + `\n\n### AI Summary\n${result}`);
      } else {
         setMarkdown(result);
      }
      setStatusMsg('AI operation complete.');
    } catch (error) {
      setStatusMsg('AI operation failed. Check API Key.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Save: Cmd+S
      if (isMod && e.key === 's') {
        e.preventDefault();
        setStatusMsg('Document saved locally.');
        setTimeout(() => setStatusMsg(''), 2000);
      }
      
      // Mode Switching: Cmd+Shift+E/S/P
      if (isMod && e.shiftKey) {
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          setMode(EditorMode.EDIT);
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setMode(EditorMode.SPLIT);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setMode(EditorMode.PREVIEW);
        }
      }

      // Toggle AI Menu: Cmd+Space
      if (isMod && e.code === 'Space') {
        e.preventDefault();
        setShowAiMenu(prev => !prev);
        setShowExportMenu(false);
      }

      // Find: Cmd+F (already partially handled in Editor, but ensure consistent state toggle)
      if (isMod && e.key === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
        // Focus usually handled by editor effect
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-slate-200 overflow-hidden font-sans">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        onExport={handleExport}
        onAIAction={handleAIAction}
        isGenerating={isGenerating}
        showSearch={showSearch}
        onToggleSearch={() => setShowSearch(!showSearch)}
        showAiMenu={showAiMenu}
        setShowAiMenu={setShowAiMenu}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(mode === EditorMode.EDIT || mode === EditorMode.SPLIT) && (
          <div className={`flex-1 border-r border-dark-border ${mode === EditorMode.SPLIT ? 'w-1/2' : 'w-full'} relative`}>
            <Editor 
              value={markdown} 
              onChange={setMarkdown} 
              showSearch={showSearch}
              onCloseSearch={() => setShowSearch(false)}
            />
          </div>
        )}

        {/* Preview Pane */}
        {(mode === EditorMode.PREVIEW || mode === EditorMode.SPLIT) && (
          <div className={`flex-1 ${mode === EditorMode.SPLIT ? 'w-1/2' : 'w-full'}`}>
            <Preview content={markdown} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono select-none">
        <div className="flex gap-4">
           <span>CHARS: {markdown.length}</span>
           <span>WORDS: {markdown.split(/\s+/).filter(w => w.length > 0).length}</span>
           <span className="hidden sm:inline">SHORTCUTS: CMD+S(SAVE) CMD+SHIFT+S(SPLIT) CMD+SPACE(AI)</span>
        </div>
        <div className="flex items-center gap-2">
            {statusMsg && <span className="text-tech-400 animate-pulse font-bold">{statusMsg}</span>}
            <span className="opacity-50">NEBULA.SYS // READY</span>
        </div>
      </div>
    </div>
  );
};

export default App;
