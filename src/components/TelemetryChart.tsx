import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { TelemetryPoint } from '../types';

interface TelemetryChartProps {
  title: string;
  metricLabel: string;
  unit: string;
  currentValue: number;
  dataHistory: TelemetryPoint[];
  colorTheme: 'thermal' | 'moisture';
  optimalRange: [number, number];
  subTitle?: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  title,
  metricLabel,
  unit,
  currentValue,
  dataHistory,
  colorTheme,
  optimalRange,
  subTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ point: TelemetryPoint; x: number; y: number } | null>(null);
  const [timeWindow, setTimeWindow] = useState<'30s' | '5m' | '15m'>('30s');

  const themeConfig = useMemo(() => {
    if (colorTheme === 'thermal') {
      return {
        lineColor: '#f43f5e',
        gradientStart: 'rgba(244, 63, 94, 0.35)',
        gradientEnd: 'rgba(244, 63, 94, 0.02)',
        pointColor: '#e11d48',
        tagBg: 'var(--thermal-rose-tint)',
        tagColor: 'var(--thermal-rose-deep)',
      };
    }
    return {
      lineColor: '#0ea5e9',
      gradientStart: 'rgba(14, 165, 233, 0.35)',
      gradientEnd: 'rgba(14, 165, 233, 0.02)',
      pointColor: '#0284c7',
      tagBg: 'var(--water-blue-tint)',
      tagColor: 'var(--water-blue-deep)',
    };
  }, [colorTheme]);

  // Calculations for stats
  const stats = useMemo(() => {
    if (!dataHistory.length) return { min: currentValue, max: currentValue, avg: currentValue };
    const values = dataHistory.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    return { min, max, avg };
  }, [dataHistory, currentValue]);

  // Render Chart Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const padding = { top: 25, right: 30, bottom: 42, left: 45 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    if (dataHistory.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      ctx.fillText('Connecting & awaiting sensor telemetry...', rect.width / 2, rect.height / 2);
      return;
    }

    const chartPoints =
      dataHistory.length === 1
        ? [
            { timestamp: new Date(dataHistory[0].timestamp.getTime() - 5000), value: dataHistory[0].value },
            dataHistory[0],
          ]
        : dataHistory;

    const values = chartPoints.map(d => d.value);
    const minVal = Math.floor(Math.min(...values, optimalRange[0]) - 2);
    const maxVal = Math.ceil(Math.max(...values, optimalRange[1]) + 2);
    const valRange = maxVal - minVal || 1;

    // Helper functions for coordinates
    const getX = (index: number) => padding.left + (index / (chartPoints.length - 1)) * chartWidth;
    const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / valRange) * chartHeight;

    // Draw Subtle Horizontal Grid Lines & Y Axis Ticks
    const ySteps = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= ySteps; i++) {
      const stepVal = minVal + (valRange / ySteps) * i;
      const y = getY(stepVal);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px "Fira Code", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(stepVal)}${unit}`, padding.left - 8, y);
    }
    ctx.setLineDash([]);

    // Draw X Axis Timestamps
    const xStepCount = Math.min(5, chartPoints.length);
    const stepInterval = Math.max(1, Math.floor((chartPoints.length - 1) / (xStepCount - 1)));

    for (let i = 0; i < chartPoints.length; i += stepInterval) {
      const point = chartPoints[i];
      const x = getX(i);
      const timeStr = point.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10.5px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, rect.height - 14);

      // Small tick mark
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.moveTo(x, rect.height - padding.bottom);
      ctx.lineTo(x, rect.height - padding.bottom + 5);
      ctx.stroke();
    }

    // Draw Smooth Area Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, themeConfig.gradientStart);
    gradient.addColorStop(1, themeConfig.gradientEnd);

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(chartPoints[0].value));

    for (let i = 0; i < chartPoints.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(chartPoints[i].value);
      const x1 = getX(i + 1);
      const y1 = getY(chartPoints[i + 1].value);

      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;

      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x1, y1);
    }

    ctx.lineTo(getX(chartPoints.length - 1), padding.top + chartHeight);
    ctx.lineTo(getX(0), padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Main Bézier Curve Line
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(chartPoints[0].value));

    for (let i = 0; i < chartPoints.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(chartPoints[i].value);
      const x1 = getX(i + 1);
      const y1 = getY(chartPoints[i + 1].value);

      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;

      ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, x1, y1);
    }

    ctx.strokeStyle = themeConfig.lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw Latest Point Pulse
    const latestIdx = chartPoints.length - 1;
    const latestX = getX(latestIdx);
    const latestY = getY(chartPoints[latestIdx].value);

    // Glowing outer ring
    ctx.beginPath();
    ctx.arc(latestX, latestY, 8, 0, Math.PI * 2);
    ctx.fillStyle = themeConfig.gradientStart;
    ctx.fill();

    // Solid inner core
    ctx.beginPath();
    ctx.arc(latestX, latestY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = themeConfig.pointColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hover Crosshair (if active)
    if (hoveredPoint) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.moveTo(hoveredPoint.x, padding.top);
      ctx.lineTo(hoveredPoint.x, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hoveredPoint.x, hoveredPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = themeConfig.pointColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }, [dataHistory, themeConfig, optimalRange, unit, hoveredPoint]);

  // Handle Mouse Hover on Canvas for Interactive Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || dataHistory.length < 2) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { top: 25, right: 30, bottom: 42, left: 45 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    if (mouseX < padding.left || mouseX > rect.width - padding.right) {
      setHoveredPoint(null);
      return;
    }

    const relX = (mouseX - padding.left) / chartWidth;
    const closestIdx = Math.min(
      dataHistory.length - 1,
      Math.max(0, Math.round(relX * (dataHistory.length - 1)))
    );

    const point = dataHistory[closestIdx];
    const values = dataHistory.map(d => d.value);
    const minVal = Math.floor(Math.min(...values, optimalRange[0]) - 2);
    const maxVal = Math.ceil(Math.max(...values, optimalRange[1]) + 2);
    const valRange = maxVal - minVal || 1;

    const x = padding.left + (closestIdx / (dataHistory.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((point.value - minVal) / valRange) * chartHeight;

    setHoveredPoint({ point, x, y });
  };

  const isOptimal = currentValue >= optimalRange[0] && currentValue <= optimalRange[1];

  return (
    <div className="soft-card" style={{ padding: '24px' }}>
      {/* Top Header & Key Stat */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              {metricLabel}
            </span>
            <span
              className="soft-pill"
              style={{
                color: isOptimal ? 'var(--nature-green-deep)' : 'var(--amber-warm)',
                background: isOptimal ? 'var(--nature-green-tint)' : 'var(--amber-tint)',
              }}
            >
              {isOptimal ? '● In Safe Range' : '▲ Action Threshold'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {title}
          </h3>
          {subTitle && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {subTitle}
            </p>
          )}
        </div>

        {/* Live Big Number Value */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {currentValue.toFixed(1)}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
            Live Feed: 5s Interval
          </span>
        </div>
      </div>

      {/* Metric High/Low/Avg Mini Bar */}
      <div
        className="soft-well"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          padding: '10px 14px',
          gap: '12px',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Min Recorded
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {stats.min.toFixed(1)}{unit}
          </div>
        </div>
        <div style={{ borderLeft: 'var(--border-divider)', borderRight: 'var(--border-divider)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Average
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {stats.avg.toFixed(1)}{unit}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Peak Recorded
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {stats.max.toFixed(1)}{unit}
          </div>
        </div>
      </div>

      {/* Chart Canvas & Interactive Tooltip */}
      <div style={{ position: 'relative', height: '220px', width: '100%' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="soft-card"
            style={{
              position: 'absolute',
              left: `${Math.min(hoveredPoint.x, 320)}px`,
              top: `${Math.max(10, hoveredPoint.y - 65)}px`,
              padding: '8px 12px',
              borderRadius: '10px',
              pointerEvents: 'none',
              transform: 'translate(-50%, -100%)',
              zIndex: 10,
              boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {hoveredPoint.point.value.toFixed(1)}{unit}
            </div>
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
              Time: {hoveredPoint.point.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      {/* Time Window Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
          Target Safe Range: {optimalRange[0]}–{optimalRange[1]}{unit}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['30s', '5m', '15m'] as const).map(w => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`soft-button ${timeWindow === w ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '0.7rem',
                borderRadius: '8px',
                boxShadow: timeWindow === w ? 'var(--shadow-soft-btn-active)' : 'var(--shadow-soft-btn)',
              }}
            >
              {w === '30s' ? 'Realtime' : w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
