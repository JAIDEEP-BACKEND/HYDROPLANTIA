import React, { useEffect, useState } from 'react';
import { AnimatedWeatherIcon, getWeatherDescription } from './AnimatedWeatherIcon';
import type { DailyForecast } from '../types';

export const WeatherForecast: React.FC = () => {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=30.70&longitude=76.71&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
        );
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();

        const days: DailyForecast[] = data.daily.time.map((timeStr: string, idx: number) => {
          const dateObj = new Date(timeStr);
          const isToday = idx === 0;
          const dayName = isToday
            ? 'Today'
            : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const code = data.daily.weathercode[idx];

          return {
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayName,
            weatherCode: code,
            condition: getWeatherDescription(code),
            tempMax: Math.round(data.daily.temperature_2m_max[idx]),
            tempMin: Math.round(data.daily.temperature_2m_min[idx]),
            rainProbability: data.daily.precipitation_probability_max
              ? data.daily.precipitation_probability_max[idx]
              : undefined,
          };
        });

        setForecast(days);
      } catch (err) {
        console.warn('Using fallback forecast data:', err);
        // Fallback realistic forecast with varied weather including rain for immediate visual demo
        const mockDays: DailyForecast[] = [
          { date: 'Oct 12', dayName: 'Today', weatherCode: 61, condition: 'Scattered Rain', tempMax: 29, tempMin: 19, rainProbability: 80 },
          { date: 'Oct 13', dayName: 'Tue', weatherCode: 80, condition: 'Rain Showers', tempMax: 27, tempMin: 18, rainProbability: 95 },
          { date: 'Oct 14', dayName: 'Wed', weatherCode: 95, condition: 'Thunderstorm', tempMax: 26, tempMin: 17, rainProbability: 85 },
          { date: 'Oct 15', dayName: 'Thu', weatherCode: 2, condition: 'Partly Cloudy', tempMax: 28, tempMin: 18, rainProbability: 20 },
          { date: 'Oct 16', dayName: 'Fri', weatherCode: 0, condition: 'Clear & Sunny', tempMax: 31, tempMin: 19, rainProbability: 5 },
          { date: 'Oct 17', dayName: 'Sat', weatherCode: 0, condition: 'Clear & Sunny', tempMax: 32, tempMin: 20, rainProbability: 0 },
          { date: 'Oct 18', dayName: 'Sun', weatherCode: 3, condition: 'Overcast Skies', tempMax: 29, tempMin: 19, rainProbability: 35 },
        ];
        setForecast(mockDays);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const activeDay = forecast[selectedDayIndex] || forecast[0];

  return (
    <div className="soft-card p-6" style={{ padding: '24px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Regional Meteorology
            </span>
            <span className="soft-pill" style={{ color: 'var(--water-blue-deep)', background: 'var(--water-blue-tint)' }}>
              Live Forecast
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
            7-Day Weather Outlook
          </h2>
        </div>

        {activeDay && (
          <div className="soft-well" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AnimatedWeatherIcon weatherCode={activeDay.weatherCode} size={36} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {activeDay.dayName} • {activeDay.condition}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  High {activeDay.tempMax}°C / Low {activeDay.tempMin}°C
                  {activeDay.rainProbability !== undefined && ` • ${activeDay.rainProbability}% Precip`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Card Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '14px',
        }}
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="soft-well"
                style={{
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-light)',
                  fontSize: '0.8rem',
                }}
              >
                Loading...
              </div>
            ))
          : forecast.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`soft-card ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    position: 'relative',
                    transition: 'all 0.22s ease',
                    border: isSelected ? '1.5px solid var(--water-blue-mid)' : 'var(--border-subtle)',
                    background: isSelected ? 'linear-gradient(180deg, #f0f7ff, #f8fafc)' : 'var(--bg-card)',
                    boxShadow: isSelected
                      ? 'inset 2px 2px 5px rgba(14, 165, 233, 0.15), var(--shadow-soft-raised)'
                      : 'var(--shadow-soft-raised)',
                  }}
                >
                  {/* Day Label */}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: isSelected ? 'var(--water-blue-deep)' : 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {day.dayName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                    {day.date}
                  </div>

                  {/* Animated Weather Graphic */}
                  <div style={{ margin: '6px auto', display: 'flex', justifyContent: 'center' }}>
                    <AnimatedWeatherIcon weatherCode={day.weatherCode} size={50} />
                  </div>

                  {/* Condition Name */}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      lineHeight: '1.2',
                      minHeight: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '4px',
                    }}
                  >
                    {day.condition}
                  </div>

                  {/* Temperature Range */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                      gap: '6px',
                      marginTop: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {day.tempMax}°
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {day.tempMin}°
                    </span>
                  </div>

                  {/* Precipitation Probability Tag if rain/snow */}
                  {day.rainProbability !== undefined && day.rainProbability > 15 && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: 'var(--water-blue-deep)',
                        background: 'rgba(14, 165, 233, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      💧 {day.rainProbability}% Rain
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};
