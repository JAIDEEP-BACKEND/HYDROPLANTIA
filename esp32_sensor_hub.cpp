#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <FirebaseClient.h>

// Libraries for 1.3 inch OLED Display (SH110X)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

// Library for DHT Sensor
#include <DHT.h>

// --- Wi-Fi Credentials ---
#define WIFI_SSID "NOWHERE1"
#define WIFI_PASSWORD "12345678"

// --- Firebase Configuration ---
// Note: With FirebaseClient, the HOST should not include "https://"
#define FIREBASE_HOST "arduhub-default-rtdb.firebaseio.com" 
#define FIREBASE_AUTH "drZoy2BkkPkN6m3quMJC3bxORnIuNfROIOrK8ZCq"

// --- Sensor Pin Definitions ---
#define DHT_PIN 14       // DHT11 Data
#define SOIL_PIN 34      // Soil Moisture Analog
#define PIR_PIN 13       // PIR Sensor Input
#define BUZZER_PIN 12    // Buzzer Output

// --- DHT Sensor Configuration ---
#define DHT_TYPE DHT11   
DHT dht(DHT_PIN, DHT_TYPE);

// --- 1.3" OLED Display Configuration (SH110X) ---
#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 
#define OLED_RESET    -1 
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- Firebase Objects (v2.2.9 Architecture) ---
using namespace firebase_ns; 

WiFiClientSecure ssl_client;
DefaultNetwork network;
AsyncClient aClient(ssl_client, getNetwork(network));
FirebaseApp app;
RealtimeDatabase Database;
LegacyToken dbSecret(FIREBASE_AUTH);

// --- Global Variables ---
unsigned long sendDataPrevMillis = 0;
const unsigned long SEND_INTERVAL = 5000; 
unsigned long lastMotionTime = 0;         
const unsigned long BUZZER_TIMEOUT = 5000; 

float temperature = 0.0;
int soilMoisture = 0;

// Helper to update the OLED screen
void updateDisplay(float temp, int moisture, bool motion) {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("   HYDRO PLANTIA   ");
    display.drawLine(0, 10, 128, 10, SH110X_WHITE);
    
    display.setCursor(0, 20);
    display.printf("Temp: %.1f C", temp);
    
    display.setCursor(0, 35);
    display.printf("Moisture: %d %%", moisture);
    
    display.setCursor(0, 50);
    if (motion) {
        display.println(">> ALERT: MOTION <<");
    } else {
        display.println("Status: Monitoring");
    }
    display.display();
}

// Result callback for Firebase v2.2.9 - Must use AsyncResult&
void asyncCB(AsyncResult &aResult) {
    if (aResult.isError()) {
        Serial.printf("Firebase Error: %s\n", aResult.error().message().c_str());
    }
}

void setup() {
    Serial.begin(115200);

    // --- Initialize Pins ---
    pinMode(PIR_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);

    // --- Initialize 1.3" OLED ---
    delay(250); 
    if(!display.begin(0x3C, true)) {
        Serial.println(F("SH110X allocation failed"));
    }
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SH110X_WHITE);
    display.setCursor(0,0);
    display.println("Hydro Plantia");
    display.println("Firebase v2.2.9");
    display.println("Initializing...");
    display.display();

    dht.begin();

    // --- Connect WiFi ---
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(300);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected");

    // --- Initialize Firebase Client ---
    ssl_client.setInsecure(); // Required for connection without SSL cert validation
    
    // In v2.2.9, initialize the app using the address of the legacy token
    app.setCallback(asyncCB);
    app.initializeApp(&dbSecret);

    // Setup the database connection
    Database.url(FIREBASE_HOST);
    
    Serial.println("Firebase Hub Ready");
}

void loop() {
    // Process background tasks for Firebase
    app.loop();
    Database.loop();

    // 1. Instant Security Logic (Buzzer)
    int motionDetected = digitalRead(PIR_PIN);

    if (motionDetected == HIGH) {
        digitalWrite(BUZZER_PIN, HIGH);
        lastMotionTime = millis(); 
    } else {
        if (millis() - lastMotionTime > BUZZER_TIMEOUT) {
            digitalWrite(BUZZER_PIN, LOW);
        }
    }

    // 2. Data Reporting Logic (Every 5 Seconds)
    if (app.ready() && (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0)) {
        sendDataPrevMillis = millis();

        // Read Sensors
        temperature = dht.readTemperature();
        int soilRaw = analogRead(SOIL_PIN);
        
        // Map Soil Moisture (Calibration: 2800 Dry -> 1300 Wet)
        soilMoisture = map(soilRaw, 2800, 1300, 0, 100);
        soilMoisture = constrain(soilMoisture, 0, 100);

        if (!isnan(temperature)) {
            // Push data - v2.2.9 uses automatic type inference
            Database.set(aClient, "/esp32/temperature", temperature);
            Database.set(aClient, "/esp32/soil_moisture", soilMoisture);
            Database.set(aClient, "/esp32/motion_active", (motionDetected == HIGH));
            
            Serial.printf("Data Pushed: Temp: %.1f, Soil: %d%%\n", temperature, soilMoisture);
        }

        // --- Update OLED ---
        updateDisplay(temperature, soilMoisture, (motionDetected == HIGH));
    }
}