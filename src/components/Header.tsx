import React, { useState, useEffect } from 'react';

interface HeaderProps {
  isConnected: boolean;
  activeValvesCount: number;
  lastSyncTime: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  activeValvesCount,
  lastSyncTime,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header
      className="soft-card"
      style={{
        padding: '20px 28px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '18px',
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          className="soft-well"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--nature-green-deep)',
            fontSize: '1.4rem',
            boxShadow: 'var(--shadow-soft-inset)',
          }}
        >
          🌿
        </div>
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              lineHeight: 1.1,
            }}
          >
            Hydro <span style={{ color: 'var(--nature-green-deep)' }}>Plantia</span>
          </h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Canal & Irrigation Water Management
          </p>
        </div>
      </div>

      {/* System Telemetry & Time Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Active Canals Count */}
        <div className="soft-pill soft-pill-inset" style={{ padding: '6px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status:</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {activeValvesCount} of 2 Canals Open
          </span>
        </div>

        {/* Live Clock */}
        <div
          className="soft-well"
          style={{
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{formattedDate}</span>
          <span style={{ color: 'var(--water-blue-deep)' }}>{formattedTime}</span>
        </div>

        {/* Real Firebase Connection Badge */}
        <div
          className="soft-pill"
          style={{
            padding: '6px 14px',
            fontSize: '0.75rem',
            background: isConnected ? 'var(--nature-green-tint)' : 'var(--bg-inset)',
            color: isConnected ? 'var(--nature-green-deep)' : 'var(--text-muted)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? 'var(--nature-green-mid)' : '#94a3b8',
              animation: isConnected ? 'pulseDot 2s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ fontWeight: 700 }}>
            {isConnected ? 'Firebase Sync Online' : 'Connecting to Firebase...'}
          </span>
          {lastSyncTime && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
