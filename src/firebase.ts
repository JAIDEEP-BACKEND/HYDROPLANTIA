declare global {
  interface Window {
    firebase: any;
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyCIdmbpwWmE26iH8l7T5Au2ziUKlKDgJ5U",
  authDomain: "arduhub.firebaseapp.com",
  databaseURL: "https://arduhub-default-rtdb.firebaseio.com",
  projectId: "arduhub",
  storageBucket: "arduhub.appspot.com",
  messagingSenderId: "229042276706",
  appId: "1:229042276706:web:b67270ae3c58bea248843b"
};

let databaseInstance: any = null;

export const initFirebase = (): any => {
  if (databaseInstance) return databaseInstance;

  try {
    if (typeof window !== 'undefined' && window.firebase) {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      databaseInstance = window.firebase.database();
      return databaseInstance;
    }
  } catch (err) {
    console.warn('Firebase SDK init notice:', err);
  }
  return null;
};

// Immediate direct fetch for real initial data from Firebase REST
export const fetchInitialFirebaseData = async (): Promise<{
  temperature: number | null;
  soilMoisture: number | null;
  command: string;
}> => {
  try {
    const [esp32Res, esp8266Res] = await Promise.all([
      fetch('https://arduhub-default-rtdb.firebaseio.com/esp32.json'),
      fetch('https://arduhub-default-rtdb.firebaseio.com/esp8266/command.json'),
    ]);

    const esp32Data = esp32Res.ok ? await esp32Res.json() : null;
    const command = esp8266Res.ok ? await esp8266Res.json() : '';

    return {
      temperature: esp32Data?.temperature !== undefined ? Number(esp32Data.temperature) : null,
      soilMoisture: esp32Data?.soil_moisture !== undefined ? Number(esp32Data.soil_moisture) : null,
      command: typeof command === 'string' ? command : '',
    };
  } catch (err) {
    console.warn('Initial REST fetch failed:', err);
    return { temperature: null, soilMoisture: null, command: '' };
  }
};

// Subscribe to real-time events from Firebase
export const subscribeToTelemetry = (
  onTempChange: (temp: number) => void,
  onMoistureChange: (moisture: number) => void,
  onCommandChange: (command: string) => void
): (() => void) => {
  const db = initFirebase();

  if (db) {
    const tempRef = db.ref('esp32/temperature');
    const moistRef = db.ref('esp32/soil_moisture');
    const cmdRef = db.ref('esp8266/command');

    const handleTemp = (snap: any) => {
      const val = snap.val();
      if (typeof val === 'number') onTempChange(val);
      else if (val !== null) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) onTempChange(parsed);
      }
    };

    const handleMoist = (snap: any) => {
      const val = snap.val();
      if (typeof val === 'number') onMoistureChange(val);
      else if (val !== null) {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) onMoistureChange(parsed);
      }
    };

    const handleCmd = (snap: any) => {
      const val = snap.val();
      if (typeof val === 'string') onCommandChange(val);
    };

    tempRef.on('value', handleTemp);
    moistRef.on('value', handleMoist);
    cmdRef.on('value', handleCmd);

    return () => {
      tempRef.off('value', handleTemp);
      moistRef.off('value', handleMoist);
      cmdRef.off('value', handleCmd);
    };
  } else {
    // REST polling fallback every 3 seconds for 100% reliability
    const pollInterval = setInterval(async () => {
      try {
        const [esp32Res, cmdRes] = await Promise.all([
          fetch('https://arduhub-default-rtdb.firebaseio.com/esp32.json'),
          fetch('https://arduhub-default-rtdb.firebaseio.com/esp8266/command.json'),
        ]);

        if (esp32Res.ok) {
          const esp32 = await esp32Res.json();
          if (esp32 && typeof esp32.temperature === 'number') {
            onTempChange(esp32.temperature);
          }
          if (esp32 && typeof esp32.soil_moisture === 'number') {
            onMoistureChange(esp32.soil_moisture);
          }
        }

        if (cmdRes.ok) {
          const cmd = await cmdRes.json();
          if (typeof cmd === 'string') {
            onCommandChange(cmd);
          }
        }
      } catch (e) {
        // Network catch
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }
};

// Send command to Firebase RTDB
export const sendCanalCommand = async (command: string): Promise<boolean> => {
  const db = initFirebase();

  if (db) {
    try {
      await db.ref('esp8266/command').set(command);
      return true;
    } catch (e) {
      console.warn('Firebase SDK command write, fallback to REST:', e);
    }
  }

  // Direct REST write fallback
  try {
    const res = await fetch('https://arduhub-default-rtdb.firebaseio.com/esp8266/command.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    return res.ok;
  } catch (err) {
    console.error('Error sending canal command:', err);
    return false;
  }
};
