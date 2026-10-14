import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TelemetryChart } from './components/TelemetryChart';
import { WeatherForecast } from './components/WeatherForecast';
import { WaterSeparatorCanals } from './components/WaterSeparatorCanals';
import type { TelemetryPoint } from './types';
import {
  fetchInitialFirebaseData,
  subscribeToTelemetry,
  sendCanalCommand,
} from './firebase';

export const App: React.FC = () => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [soilMoisture, setSoilMoisture] = useState<number | null>(null);
  const [tempHistory, setTempHistory] = useState<TelemetryPoint[]>([]);
  const [moistureHistory, setMoistureHistory] = useState<TelemetryPoint[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Keep references to latest readings for periodic sampling
  const latestTempRef = useRef<number | null>(null);
  const latestMoistRef = useRef<number | null>(null);

  useEffect(() => {
    latestTempRef.current = temperature;
  }, [temperature]);

  useEffect(() => {
    latestMoistRef.current = soilMoisture;
  }, [soilMoisture]);

  // Step 1: Initial real data fetch from Firebase REST
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      const initial = await fetchInitialFirebaseData();
      if (!isMounted) return;

      const now = new Date();

      if (initial.temperature !== null) {
        setTemperature(initial.temperature);
        latestTempRef.current = initial.temperature;
        setTempHistory([{ timestamp: now, value: initial.temperature }]);
      }

      if (initial.soilMoisture !== null) {
        setSoilMoisture(initial.soilMoisture);
        latestMoistRef.current = initial.soilMoisture;
        setMoistureHistory([{ timestamp: now, value: initial.soilMoisture }]);
      }

      if (initial.command) {
        setCurrentCommand(initial.command);
      }

      if (initial.temperature !== null || initial.soilMoisture !== null) {
        setIsConnected(true);
        setLastSyncTime(now);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Step 2: Subscribe to live Firebase Realtime Database
  useEffect(() => {
    const unsubscribe = subscribeToTelemetry(
      (newTemp) => {
        const now = new Date();
        setTemperature(newTemp);
        latestTempRef.current = newTemp;
        setIsConnected(true);
        setLastSyncTime(now);

        setTempHistory((prev) => {
          const updated = [...prev, { timestamp: now, value: newTemp }];
          return updated.length > 25 ? updated.slice(-25) : updated;
        });
      },
      (newMoist) => {
        const now = new Date();
        setSoilMoisture(newMoist);
        latestMoistRef.current = newMoist;
        setIsConnected(true);
        setLastSyncTime(now);

        setMoistureHistory((prev) => {
          const updated = [...prev, { timestamp: now, value: newMoist }];
          return updated.length > 25 ? updated.slice(-25) : updated;
        });
      },
      (newCmd) => {
        setCurrentCommand(newCmd);
        setIsConnected(true);
        setLastSyncTime(new Date());
      }
    );

    return () => unsubscribe();
  }, []);

  // Step 3: Record real data point into graph buffer every 5 seconds if telemetry is unchanged
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      if (latestTempRef.current !== null) {
        const val = latestTempRef.current;
        setTempHistory((prev) => {
          const updated = [...prev, { timestamp: now, value: val }];
          return updated.length > 25 ? updated.slice(-25) : updated;
        });
      }

      if (latestMoistRef.current !== null) {
        const val = latestMoistRef.current;
        setMoistureHistory((prev) => {
          const updated = [...prev, { timestamp: now, value: val }];
          return updated.length > 25 ? updated.slice(-25) : updated;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Send real command to Firebase
  const handleSendCommand = (cmd: string) => {
    setCurrentCommand(cmd);
    sendCanalCommand(cmd);
  };

  // Compute active gates from actual Firebase command
  const isCanal1Open =
    currentCommand === 'open1' ||
    currentCommand === 'openall' ||
    (currentCommand !== 'close1' && currentCommand !== 'closeall' && currentCommand.includes('1'));

  const isCanal2Open =
    currentCommand === 'open2' ||
    currentCommand === 'openall' ||
    (currentCommand !== 'close2' && currentCommand !== 'closeall' && currentCommand.includes('2'));

  const activeValvesCount = (isCanal1Open ? 1 : 0) + (isCanal2Open ? 1 : 0);

  return (
    <div className="app-container">
      {/* Top Soft UI Navigation Header */}
      <Header
        isConnected={isConnected}
        activeValvesCount={activeValvesCount}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '26px' }}>
        {/* Top Split: Real Sensor Graphs & Canal Separator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '26px',
            alignItems: 'start',
          }}
        >
          {/* Telemetry Charts (Ambient Temperature & Soil Hydration) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TelemetryChart
              title="Ambient Temperature"
              metricLabel="Thermal Telemetry"
              unit="°C"
              currentValue={temperature !== null ? temperature : 0}
              dataHistory={tempHistory}
              colorTheme="thermal"
              optimalRange={[20, 32]}
              subTitle="Atmospheric conditions from ESP32 telemetry sensor"
            />

            <TelemetryChart
              title="Soil Hydration Level"
              metricLabel="Moisture Telemetry"
              unit="%"
              currentValue={soilMoisture !== null ? soilMoisture : 0}
              dataHistory={moistureHistory}
              colorTheme="moisture"
              optimalRange={[45, 75]}
              subTitle="Subsurface root absorption probe measurement"
            />
          </div>

          {/* Graphical Water Separator & Two-Canal Diverter */}
          <div>
            <WaterSeparatorCanals
              onSendCommand={handleSendCommand}
              currentCommand={currentCommand}
            />
          </div>
        </div>

        {/* Bottom Full-Width Section: 7-Day Weather Forecast with Animated Weather Visuals */}
        <div>
          <WeatherForecast />
        </div>
      </div>
    </div>
  );
};

export default App;
