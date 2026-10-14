import React from 'react';

interface AnimatedWeatherIconProps {
  weatherCode: number;
  size?: number;
  className?: string;
}

export const getWeatherType = (code: number): 'sun' | 'partlyCloudy' | 'cloudy' | 'drizzle' | 'rain' | 'thunder' | 'snow' | 'fog' => {
  if (code === 0) return 'sun';
  if (code === 1 || code === 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95) return 'thunder';
  return 'sun';
};

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear & Sunny';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast Skies';
  if (code === 45 || code === 48) return 'Morning Mist';
  if (code >= 51 && code <= 57) return 'Light Drizzle';
  if (code === 61 || code === 80) return 'Rain Showers';
  if (code >= 62 && code <= 67) return 'Continuous Rain';
  if (code >= 71 && code <= 77) return 'Light Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear Sky';
};

export const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  weatherCode,
  size = 58,
  className = '',
}) => {
  const type = getWeatherType(weatherCode);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title={getWeatherDescription(weatherCode)}
    >
      {/* 1. SUN / CLEAR (Golden spinning corona rays + pulsating warm core) */}
      {type === 'sun' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          <g
            style={{
              transformOrigin: '32px 32px',
              animation: 'sunRaysRotate 16s linear infinite',
            }}
          >
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <line
                key={i}
                x1="32"
                y1="7"
                x2="32"
                y2="13"
                stroke={i % 2 === 0 ? '#f59e0b' : '#fbbf24'}
                strokeWidth={i % 2 === 0 ? '3.5' : '2.5'}
                strokeLinecap="round"
                transform={`rotate(${angle} 32 32)`}
              />
            ))}
          </g>
          <circle
            cx="32"
            cy="32"
            r="14"
            fill="url(#sunWarmGrad)"
            style={{
              animation: 'sunPulseGlow 3s ease-in-out infinite',
              transformOrigin: '32px 32px',
            }}
          />
          <defs>
            <linearGradient id="sunWarmGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 2. PARTLY CLOUDY (Sun with gently floating puffy cloud) */}
      {type === 'partlyCloudy' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Sun background */}
          <g style={{ transformOrigin: '24px 22px', animation: 'sunRaysRotate 20s linear infinite' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="24"
                y1="5"
                x2="24"
                y2="10"
                stroke="#f59e0b"
                strokeWidth="2.8"
                strokeLinecap="round"
                transform={`rotate(${angle} 24 22)`}
              />
            ))}
          </g>
          <circle
            cx="24"
            cy="22"
            r="11"
            fill="#f59e0b"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.65))' }}
          />

          {/* Drifting soft cloud */}
          <g style={{ animation: 'cloudDriftSmooth 3.8s ease-in-out infinite' }}>
            <path
              d="M20 46h24a10 10 0 0 0 2-19.8 14 14 0 0 0-26.6-3.8A11 11 0 0 0 20 46z"
              fill="url(#cloudGradSoft)"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              style={{ filter: 'drop-shadow(0 4px 7px rgba(71, 85, 105, 0.2))' }}
            />
          </g>
          <defs>
            <linearGradient id="cloudGradSoft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 3. CLOUDY / OVERCAST (Dual layered drifting clouds) */}
      {type === 'cloudy' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          <g style={{ animation: 'cloudDriftSmooth 5s ease-in-out infinite alternate', opacity: 0.7 }}>
            <path
              d="M15 35h22a8 8 0 0 0 1.6-15.8 11 11 0 0 0-21-3A9 9 0 0 0 15 35z"
              fill="#94a3b8"
            />
          </g>
          <g style={{ animation: 'cloudDriftSmooth 3.6s ease-in-out infinite' }}>
            <path
              d="M18 47h28a11 11 0 0 0 2.2-21.8 15 15 0 0 0-28.7-4.2A12 12 0 0 0 18 47z"
              fill="url(#cloudGradOvercast)"
              stroke="#94a3b8"
              strokeWidth="1.2"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(71, 85, 105, 0.25))' }}
            />
          </g>
          <defs>
            <linearGradient id="cloudGradOvercast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 4. RAIN / SHOWERS (Animated Cloud with Continuous Falling Raindrops & Splash) */}
      {type === 'rain' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Main Rain Cloud */}
          <g style={{ animation: 'cloudDriftSmooth 4s ease-in-out infinite' }}>
            <path
              d="M16 35h32a11 11 0 0 0 2.2-21.8 15 15 0 0 0-28.7-4.2A12 12 0 0 0 16 35z"
              fill="url(#rainCloudGrad)"
              stroke="#64748b"
              strokeWidth="1.2"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(30, 41, 59, 0.28))' }}
            />
          </g>

          {/* Multiple Cascading Raindrop Streaks */}
          <g>
            <line
              x1="20"
              y1="38"
              x2="17"
              y2="49"
              stroke="#0284c7"
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ animation: 'rainStreak 0.85s cubic-bezier(0.5, 0, 0.75, 0) infinite' }}
            />
            <line
              x1="27"
              y1="38"
              x2="24"
              y2="50"
              stroke="#0ea5e9"
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ animation: 'rainStreak 1.05s cubic-bezier(0.5, 0, 0.75, 0) infinite 0.2s' }}
            />
            <line
              x1="34"
              y1="38"
              x2="31"
              y2="49"
              stroke="#38bdf8"
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ animation: 'rainStreak 0.9s cubic-bezier(0.5, 0, 0.75, 0) infinite 0.45s' }}
            />
            <line
              x1="41"
              y1="38"
              x2="38"
              y2="50"
              stroke="#0284c7"
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ animation: 'rainStreak 1.1s cubic-bezier(0.5, 0, 0.75, 0) infinite 0.12s' }}
            />
            <line
              x1="47"
              y1="39"
              x2="44"
              y2="48"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animation: 'rainStreak 0.95s cubic-bezier(0.5, 0, 0.75, 0) infinite 0.35s' }}
            />
          </g>

          {/* Splash Rings at the base */}
          <circle
            cx="24"
            cy="59"
            r="3.5"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.2"
            style={{ animation: 'rainSplashRing 1.05s ease-out infinite 0.25s' }}
          />
          <circle
            cx="38"
            cy="59"
            r="3.5"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            style={{ animation: 'rainSplashRing 1.1s ease-out infinite 0.55s' }}
          />

          <defs>
            <linearGradient id="rainCloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 5. THUNDERSTORM (Dark Cloud + Lightning Bolt Flash + Driving Rain) */}
      {type === 'thunder' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Storm Cloud */}
          <path
            d="M16 34h32a11 11 0 0 0 2.2-21.8 15 15 0 0 0-28.7-4.2A12 12 0 0 0 16 34z"
            fill="url(#stormCloudGrad)"
            stroke="#334155"
            strokeWidth="1.4"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.45))' }}
          />

          {/* Flashing Lightning Bolt */}
          <polygon
            points="33,26 24,41 32,41 27,56 42,37 34,37"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="1.2"
            style={{
              animation: 'thunderFlash 2.5s ease-in-out infinite',
              transformOrigin: '32px 41px',
            }}
          />

          {/* Quick angled rain streaks */}
          <line
            x1="19"
            y1="38"
            x2="15"
            y2="49"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: 'rainStreak 0.7s linear infinite' }}
          />
          <line
            x1="44"
            y1="38"
            x2="40"
            y2="49"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ animation: 'rainStreak 0.72s linear infinite 0.25s' }}
          />

          <defs>
            <linearGradient id="stormCloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* 6. DRIZZLE */}
      {type === 'drizzle' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          <path
            d="M16 36h32a11 11 0 0 0 2.2-21.8 15 15 0 0 0-28.7-4.2A12 12 0 0 0 16 36z"
            fill="url(#cloudGradSoft)"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <line x1="24" y1="40" x2="21" y2="46" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" style={{ animation: 'rainStreak 1.3s ease-in infinite' }} />
          <line x1="33" y1="41" x2="30" y2="47" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" style={{ animation: 'rainStreak 1.5s ease-in infinite 0.3s' }} />
          <line x1="42" y1="40" x2="39" y2="46" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" style={{ animation: 'rainStreak 1.4s ease-in infinite 0.6s' }} />
        </svg>
      )}

      {/* 7. SNOW */}
      {type === 'snow' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          <path
            d="M16 36h32a11 11 0 0 0 2.2-21.8 15 15 0 0 0-28.7-4.2A12 12 0 0 0 16 36z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          <g style={{ animation: 'snowflakeTumble 2.2s linear infinite' }}>
            <text x="21" y="49" fontSize="12" fill="#38bdf8">❄</text>
          </g>
          <g style={{ animation: 'snowflakeTumble 2.6s linear infinite 0.7s' }}>
            <text x="35" y="49" fontSize="13" fill="#0ea5e9">❄</text>
          </g>
        </svg>
      )}

      {/* 8. FOG */}
      {type === 'fog' && (
        <svg viewBox="0 0 64 64" width={size} height={size} style={{ overflow: 'visible' }}>
          <g style={{ animation: 'cloudDriftSmooth 3s ease-in-out infinite' }}>
            <line x1="14" y1="26" x2="50" y2="26" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="34" x2="46" y2="34" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <line x1="12" y1="42" x2="52" y2="42" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      )}
    </div>
  );
};
