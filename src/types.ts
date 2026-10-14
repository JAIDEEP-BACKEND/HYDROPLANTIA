export interface TelemetryPoint {
  timestamp: Date;
  value: number;
}

export interface CanalState {
  isOpen: boolean;
  pin: string;
  name: string;
  subTitle: string;
  lastChanged: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  condition: string;
  tempMax: number;
  tempMin: number;
  rainProbability?: number;
}

export interface FirebaseTelemetryState {
  temperature: number | null;
  soilMoisture: number | null;
  lastCommand: string;
  isConnected: boolean;
  lastSyncTime: Date | null;
}
