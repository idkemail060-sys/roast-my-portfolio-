import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  ReferenceLine
} from 'recharts';
import { Radar as RadarIcon, BarChart3, Info } from 'lucide-react';
import { CategoryScores } from '../../types';
import { Interactive3DCard, Interactive3DItem } from '../common/Interactive3DCard';

interface ScoresChartWidgetProps {
  scores: CategoryScores;
  overallScore: number;
}

export const ScoresChartWidget: React.FC<ScoresChartWidgetProps> = ({
  scores,
  overallScore,
}) => {
  const [chartType, setChartType] = useState<'radar' | 'bar'>('radar');

  const radarData = [
    { category: 'UI / UX', score: scores.uiUx, weight: 30, benchmark: 8.0 },
    { category: 'Performance', score: scores.performance, weight: 25, benchmark: 8.0 },
    { category: 'Accessibility', score: scores.accessibility, weight: 25, benchmark: 8.0 },
    { category: 'Content Depth', score: scores.content, weight: 20, benchmark: 8.0 },
  ];

  const barData = [
    { name: 'UI / UX', score: scores.uiUx, weight: '30%', color: '#f97316' },
    { name: 'Performance', score: scores.performance, weight: '25%', color: '#38bdf8' },
    { name: 'Accessibility', score: scores.accessibility, weight: '25%', color: '#a855f7' },
    { name: 'Content', score: scores.content, weight: '20%', color: '#34d399' },
  ];

  return (
    <Interactive3DCard
      maxTilt={4}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl"
    >
      {/* Widget Header & Chart Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <Interactive3DItem depth={25}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <h3 className="text-sm font-bold font-mono text-neutral-100 uppercase tracking-wider">
              Diagnostic Score Distribution
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Multi-axial inspection across the 4 core developer portfolio pillars
          </p>
        </Interactive3DItem>

        {/* Recharts Mode Switcher */}
        <Interactive3DItem depth={30} className="inline-flex items-center p-1 rounded-lg bg-neutral-950 border border-neutral-800 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setChartType('radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              chartType === 'radar'
                ? 'bg-neutral-800 text-orange-400 font-bold border border-neutral-700/80 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" />
            <span>Radar View</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-neutral-800 text-orange-400 font-bold border border-neutral-700/80 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar View</span>
          </button>
        </Interactive3DItem>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 sm:h-80 flex items-center justify-center my-2">
        {chartType === 'radar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#2e2e2e" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="category" 
                stroke="#a3a3a3" 
                tick={{ fontSize: 11, fill: '#d4d4d4', fontFamily: 'monospace' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 10]} 
                stroke="#525252" 
                tick={{ fontSize: 10, fill: '#737373', fontFamily: 'monospace' }} 
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#f97316"
                strokeWidth={2}
                fill="#f97316"
                fillOpacity={0.35}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-neutral-700 bg-neutral-900/95 p-2.5 shadow-xl text-xs font-mono">
                        <div className="font-bold text-neutral-100">{data.category}</div>
                        <div className="text-orange-400 font-bold mt-1">
                          Score: {Number(data.score).toFixed(1)} / 10.0
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">
                          Formula Weight: {data.weight}%
                        </div>
                        <div className="text-neutral-500 text-[10px]">
                          Target Benchmark: {data.benchmark}.0
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                stroke="#737373" 
                tick={{ fontSize: 11, fill: '#a3a3a3', fontFamily: 'monospace' }} 
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="#737373" 
                tick={{ fontSize: 11, fill: '#737373', fontFamily: 'monospace' }} 
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <ReferenceLine y={8.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 8.0', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-neutral-700 bg-neutral-900/95 p-2.5 shadow-xl text-xs font-mono">
                        <div className="font-bold text-neutral-100">{data.name}</div>
                        <div className="text-orange-400 font-bold mt-1">
                          Score: {Number(data.score).toFixed(1)} / 10.0
                        </div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">
                          Weight: {data.weight}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transparent Math Breakdown Footer */}
      <div className="pt-3 border-t border-neutral-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>Formula: (UI × 30%) + (Perf × 25%) + (A11y × 25%) + (Content × 20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Target Benchmark:</span>
          <span className="font-bold text-emerald-400">≥ 8.0 / 10</span>
        </div>
      </div>
    </Interactive3DCard>
  );
};
