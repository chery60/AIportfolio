import { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
}

export default function Splash({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 1800);
    const t3 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#08090a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      {/* Animated logo */}
      <div
        style={{
          opacity: phase === 'in' ? 0 : 1,
          transform: phase === 'in' ? 'scale(0.8) translateY(20px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: '#5e6ad2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: '700',
            color: 'white',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(94,106,210,0.4)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          SC
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#f7f8f8',
            margin: '0 0 8px',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.02em',
          }}>
            Sai Charan
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#8a8f98',
            fontFamily: 'Inter, sans-serif',
          }}>
            Product Designer · 2024
          </p>
        </div>

        {/* Loading bar */}
        <div style={{ marginTop: '40px', width: '200px', height: '2px',         background: '#191a1b', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #5e6ad2, #828fff)',
              borderRadius: '9999px',
              width: phase === 'hold' ? '100%' : '0%',
              transition: 'width 1.2s ease',
            }}
          />
        </div>
      </div>

      {/* Corner decorations */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        fontSize: '11px',
        color: '#62666d',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        PORTFOLIO.V1
      </div>
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        fontSize: '11px',
        color: '#62666d',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        2024
      </div>
    </div>
  );
}
