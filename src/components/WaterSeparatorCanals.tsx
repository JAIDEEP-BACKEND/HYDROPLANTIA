import React from 'react';

interface WaterSeparatorCanalsProps {
  onSendCommand: (command: string) => void;
  currentCommand: string;
}

export const WaterSeparatorCanals: React.FC<WaterSeparatorCanalsProps> = ({
  onSendCommand,
  currentCommand,
}) => {
  // Derive gate states directly from the real Firebase command
  const isCanal1Open =
    currentCommand === 'open1' ||
    currentCommand === 'openall' ||
    (currentCommand !== 'close1' && currentCommand !== 'closeall' && currentCommand.includes('1'));

  const isCanal2Open =
    currentCommand === 'open2' ||
    currentCommand === 'openall' ||
    (currentCommand !== 'close2' && currentCommand !== 'closeall' && currentCommand.includes('2'));

  const anyCanalOpen = isCanal1Open || isCanal2Open;

  return (
    <div className="soft-card" style={{ padding: '26px' }}>
      {/* Title & Live Firebase Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Hydraulic Distribution
            </span>
            <span
              className="soft-pill"
              style={{
                color: anyCanalOpen ? 'var(--water-blue-deep)' : 'var(--text-muted)',
                background: anyCanalOpen ? 'var(--water-blue-tint)' : 'var(--bg-inset)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: anyCanalOpen ? 'var(--water-blue-deep)' : '#94a3b8',
                  animation: anyCanalOpen ? 'pulseDot 1.8s ease-in-out infinite' : 'none',
                }}
              />
              {anyCanalOpen ? 'Water Routed' : 'Flow Halted'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            Canal Water Separator
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Two-canal sluice gate diversion controller
          </p>
        </div>

        {currentCommand && (
          <div className="soft-well" style={{ padding: '6px 14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Firebase Command:</span>
            <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--water-blue-deep)' }}>
              {currentCommand}
            </code>
          </div>
        )}
      </div>

      {/* Graphical Representation of Water Separator */}
      <div
        className="soft-well"
        style={{
          padding: '20px 16px',
          borderRadius: '18px',
          marginBottom: '26px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
            Canal Schematic & Flow Visualization
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
            Main Reservoir Supply → Diversion Weir
          </span>
        </div>

        {/* Canal SVG Flow Network */}
        <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', background: '#cbd5e1', overflow: 'hidden' }}>
          {/* Main Inflow Canal */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '75px',
              width: '140px',
              height: '70px',
              background: 'repeating-linear-gradient(90deg, #0284c7 0px, #0ea5e9 15px, #38bdf8 25px, #0284c7 40px)',
              backgroundSize: '80px 100%',
              animation: 'waterFlowWave 1.4s linear infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
              Main Supply ➔
            </div>
          </div>

          {/* Concrete Weir Divider */}
          <div
            style={{
              position: 'absolute',
              left: '140px',
              top: '40px',
              width: '80px',
              height: '140px',
              background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid #64748b',
              zIndex: 3,
            }}
          >
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.05em' }}>
              Weir
              <br />
              Divider
            </span>
            <div style={{ fontSize: '1rem', marginTop: '2px', color: '#334155' }}>⑂</div>
          </div>

          {/* CANAL 1 (Upper Branch: North Canal) */}
          <div
            style={{
              position: 'absolute',
              left: '220px',
              top: '25px',
              right: '20px',
              height: '56px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.25)',
              border: '2px solid #64748b',
              transition: 'all 0.3s ease',
            }}
            className={isCanal1Open ? 'water-flow-active' : 'water-flow-inactive'}
          >
            {/* Clickable Sluice Gate 1 Pin D1 */}
            <div
              onClick={() => onSendCommand(isCanal1Open ? 'close1' : 'open1')}
              style={{
                position: 'absolute',
                left: '22px',
                top: isCanal1Open ? '-24px' : '0px',
                width: '18px',
                height: '56px',
                background: isCanal1Open ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #ef4444, #b91c1c)',
                border: '2px solid #ffffff',
                borderRadius: '4px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
                cursor: 'pointer',
                transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
                zIndex: 4,
              }}
              title={`Click to ${isCanal1Open ? 'Close' : 'Open'} Gate 1 (Pin D1)`}
            />

            {/* Canal 1 Stream Overlay Badge */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: isCanal1Open ? 'rgba(15, 23, 42, 0.75)' : 'rgba(71, 85, 105, 0.88)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span>Canal 1 (North Field)</span>
              <span style={{ color: isCanal1Open ? '#86efac' : '#fca5a5' }}>
                {isCanal1Open ? '⚡ Gate Open • Channel Flowing' : '✖ Gate Sealed • Flow Halted'}
              </span>
            </div>
          </div>

          {/* CANAL 2 (Lower Branch: South Canal) */}
          <div
            style={{
              position: 'absolute',
              left: '220px',
              bottom: '25px',
              right: '20px',
              height: '56px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.25)',
              border: '2px solid #64748b',
              transition: 'all 0.3s ease',
            }}
            className={isCanal2Open ? 'water-flow-active' : 'water-flow-inactive'}
          >
            {/* Clickable Sluice Gate 2 Pin D2 */}
            <div
              onClick={() => onSendCommand(isCanal2Open ? 'close2' : 'open2')}
              style={{
                position: 'absolute',
                left: '22px',
                top: isCanal2Open ? '-24px' : '0px',
                width: '18px',
                height: '56px',
                background: isCanal2Open ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #ef4444, #b91c1c)',
                border: '2px solid #ffffff',
                borderRadius: '4px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
                cursor: 'pointer',
                transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
                zIndex: 4,
              }}
              title={`Click to ${isCanal2Open ? 'Close' : 'Open'} Gate 2 (Pin D2)`}
            />

            {/* Canal 2 Stream Overlay Badge */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: isCanal2Open ? 'rgba(15, 23, 42, 0.75)' : 'rgba(71, 85, 105, 0.88)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span>Canal 2 (South Field)</span>
              <span style={{ color: isCanal2Open ? '#86efac' : '#fca5a5' }}>
                {isCanal2Open ? '⚡ Gate Open • Channel Flowing' : '✖ Gate Sealed • Flow Halted'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Canal Dedicated Control Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
        {/* Canal 1 Control */}
        <div
          className="soft-card"
          style={{
            padding: '20px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Actuator Pin D1
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Canal 1
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                North Field Canal
              </p>
            </div>
            <span
              className="soft-pill"
              style={{
                color: isCanal1Open ? 'var(--nature-green-deep)' : 'var(--text-muted)',
                background: isCanal1Open ? 'var(--nature-green-tint)' : 'var(--bg-inset)',
              }}
            >
              {isCanal1Open ? '● Flow Active' : '○ Gate Closed'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => onSendCommand('open1')}
              className={`soft-button ${isCanal1Open ? 'soft-button-emerald active' : ''}`}
              style={{ padding: '12px 14px', fontSize: '0.85rem' }}
            >
              Open Sluice
            </button>
            <button
              onClick={() => onSendCommand('close1')}
              className={`soft-button ${!isCanal1Open ? 'soft-button-stop active' : ''}`}
              style={{ padding: '12px 14px', fontSize: '0.85rem' }}
            >
              Close Sluice
            </button>
          </div>
        </div>

        {/* Canal 2 Control */}
        <div
          className="soft-card"
          style={{
            padding: '20px',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Actuator Pin D2
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Canal 2
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                South Field Canal
              </p>
            </div>
            <span
              className="soft-pill"
              style={{
                color: isCanal2Open ? 'var(--nature-green-deep)' : 'var(--text-muted)',
                background: isCanal2Open ? 'var(--nature-green-tint)' : 'var(--bg-inset)',
              }}
            >
              {isCanal2Open ? '● Flow Active' : '○ Gate Closed'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => onSendCommand('open2')}
              className={`soft-button ${isCanal2Open ? 'soft-button-emerald active' : ''}`}
              style={{ padding: '12px 14px', fontSize: '0.85rem' }}
            >
              Open Sluice
            </button>
            <button
              onClick={() => onSendCommand('close2')}
              className={`soft-button ${!isCanal2Open ? 'soft-button-stop active' : ''}`}
              style={{ padding: '12px 14px', fontSize: '0.85rem' }}
            >
              Close Sluice
            </button>
          </div>
        </div>
      </div>

      {/* Master Channel Controls */}
      <div
        className="soft-well"
        style={{
          padding: '18px 20px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Master Channel Controls
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
            Simultaneous Actuation
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => onSendCommand('openall')}
            className="soft-button soft-button-emerald"
            style={{
              padding: '15px 20px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '14px',
            }}
          >
            Release Water to Both Canals
          </button>
          <button
            onClick={() => onSendCommand('closeall')}
            className="soft-button soft-button-stop"
            style={{
              padding: '15px 20px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '14px',
            }}
          >
            Halt Flow to All Canals
          </button>
        </div>
      </div>
    </div>
  );
};
