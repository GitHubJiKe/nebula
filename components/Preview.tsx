import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChartConfig, D3VizConfig } from '../types';
import { ChartRenderer, D3VizRenderer, InfoBlock, TerminalBlock } from './CustomRenderers';

// Access global Prism object from window
declare const Prism: any;

interface PreviewProps {
  content: string;
}

const Preview: React.FC<PreviewProps> = ({ content }) => {
  // Trigger Prism highlighting whenever content changes
  useEffect(() => {
    if (typeof Prism !== 'undefined') {
      const container = document.getElementById('preview-content');
      if (container) {
        Prism.highlightAllUnder(container);
      }
    }
  }, [content]);

  return (
    <div className="h-full w-full bg-dark-bg overflow-y-auto custom-scrollbar relative">
       <div className="sticky top-0 left-0 right-0 h-6 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 flex items-center px-4 text-xs text-tech-400 select-none z-10">
        PREVIEW MODE
      </div>
      <div id="preview-content" className="p-8 prose prose-invert prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-headings:font-sans prose-headings:font-bold prose-h1:text-tech-100 prose-a:text-tech-400">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Remove default pre wrapper so we can control the block completely in the 'code' renderer
            pre: ({children}) => <>{children}</>,

            // --- Custom Heading Styles ---
            h1: ({node, ...props}) => <h1 className="text-3xl font-mono font-bold text-tech-100 mb-6 border-b border-slate-800 pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-mono font-bold text-tech-200 mb-4 mt-8" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-mono font-bold text-tech-300 mb-3 mt-6" {...props} />,
            
            // --- Custom List Styles ---
            ul: ({node, ...props}) => (
              <ul 
                className="my-4 space-y-2 ml-4 list-none [&>li]:relative [&>li]:pl-6 [&>li]:before:content-['>'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-tech-500 [&>li]:before:font-mono" 
                {...props} 
              />
            ),
            ol: ({node, ...props}) => (
              <ol className="my-4 space-y-2 ml-4 list-decimal marker:text-tech-500 marker:font-mono pl-4 text-slate-300" {...props} />
            ),
            li: ({node, ...props}) => <li className="" {...props} />,

            // --- Code Blocks & Plugins ---
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              
              const strContent = String(children).replace(/\n$/, '');

              if (!inline && lang === 'chart') {
                try {
                  const config: ChartConfig = JSON.parse(strContent);
                  return <ChartRenderer config={config} />;
                } catch (e) {
                  return <div className="text-red-500 text-xs font-mono p-2 border border-red-900 bg-red-900/10">JSON Error in Chart</div>;
                }
              }

              if (!inline && lang === 'viz') {
                try {
                   const config: D3VizConfig = JSON.parse(strContent);
                   return <D3VizRenderer config={config} />;
                } catch (e) {
                   return <div className="text-red-500 text-xs font-mono p-2 border border-red-900 bg-red-900/10">JSON Error in Viz</div>;
                }
              }
              
              if (!inline && lang === 'terminal') {
                return <TerminalBlock>{strContent}</TerminalBlock>;
              }

              return !inline && match ? (
                <div className="relative group my-4">
                  <div className="absolute top-2 right-2 text-[10px] text-slate-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity select-none z-10 font-bold tracking-wider">
                    {lang}
                  </div>
                  {/* 
                      Note: We use whitespace-pre-wrap to force wrapping of long lines. 
                      We must include the <code> tag inside <pre> for PrismJS to work correctly.
                      The CSS in index.html ensures Prism doesn't override the wrap property.
                  */}
                  <pre className="block bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm whitespace-pre-wrap break-words overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-slate-800 text-tech-200 px-1.5 py-0.5 rounded text-sm font-mono whitespace-pre-wrap break-words" {...props}>
                  {children}
                </code>
              );
            },
            // Handle blockquotes
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-tech-500 pl-4 py-1 my-4 bg-slate-800/30 text-slate-300 italic">
                  {children}
                </blockquote>
              )
            },
            // Style tables
            table({ children }) {
                return (
                    <div className="overflow-x-auto my-6 border border-slate-700 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-700 text-sm">
                            {children}
                        </table>
                    </div>
                )
            },
            thead({ children }) {
                return <thead className="bg-slate-800 text-slate-200 font-semibold">{children}</thead>
            },
            th({ children }) {
                return <th className="px-4 py-3 text-left tracking-wider uppercase text-xs">{children}</th>
            },
            td({ children }) {
                return <td className="px-4 py-3 whitespace-nowrap text-slate-400 border-t border-slate-700">{children}</td>
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Preview;