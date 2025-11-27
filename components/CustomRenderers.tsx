import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import * as d3 from 'd3';
import { ChartConfig, D3VizConfig } from '../types';
import { AlertCircle, Terminal } from 'lucide-react';

// --- Recharts Renderer ---
export const ChartRenderer: React.FC<{ config: ChartConfig }> = ({ config }) => {
  if (!config || !config.data) return <div className="text-red-400 text-sm">Invalid Chart Configuration</div>;

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return (
          <LineChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {config.series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip 
               contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {config.series.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.3} />
            ))}
          </AreaChart>
        );
      case 'bar':
      default:
        return (
          <BarChart data={config.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <RechartsTooltip 
               contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {config.series.map((s) => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="my-6 p-4 border border-dark-border rounded-lg bg-dark-bg/50">
      {config.title && <h4 className="text-center text-sm font-semibold mb-4 text-tech-300 tracking-wider uppercase">{config.title}</h4>}
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- D3 Renderer ---
export const D3VizRenderer: React.FC<{ config: D3VizConfig }> = ({ config }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !config) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    if (config.type === 'progress') {
       // Background Circle
       g.append("circle")
       .attr("r", radius - 10)
       .attr("fill", "none")
       .attr("stroke", "#334155")
       .attr("stroke-width", 15);

      // Foreground Arc
      const arc = d3.arc()
        .innerRadius(radius - 17.5)
        .outerRadius(radius - 2.5)
        .startAngle(0)
        .cornerRadius(10);

      const angle = (config.value / 100) * 2 * Math.PI;

      g.append("path")
        .datum({ endAngle: angle })
        .style("fill", config.color || "#0ea5e9")
        .attr("d", arc as any);

      // Text
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text(`${config.value}%`)
        .style("fill", "#e2e8f0")
        .style("font-size", "24px")
        .style("font-family", "JetBrains Mono");
        
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "2em")
        .text(config.label)
        .style("fill", "#94a3b8")
        .style("font-size", "12px");
    }

  }, [config]);

  return (
    <div className="flex justify-center my-6">
        <svg ref={svgRef}></svg>
    </div>
  );
};

// --- Custom Block Components ---

export const InfoBlock: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div className="my-4 p-4 border-l-4 border-tech-500 bg-tech-500/10 rounded-r-md">
    <div className="flex items-center gap-2 mb-2 text-tech-400 font-bold uppercase text-xs tracking-wider">
      <AlertCircle size={16} />
      <span>{title || "Information"}</span>
    </div>
    <div className="text-slate-300">
      {children}
    </div>
  </div>
);

export const TerminalBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="my-4 rounded-md overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
      <Terminal size={14} className="text-slate-400" />
      <div className="flex gap-1.5 ml-auto">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
      </div>
    </div>
    <div className="p-4 font-mono text-sm text-green-400">
       <span className="select-none text-slate-500 mr-2">$</span>
       {children}
    </div>
  </div>
);
