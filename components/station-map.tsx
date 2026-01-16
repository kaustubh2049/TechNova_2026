import { LocationData, Station } from "@/providers/stations-provider";
import { ProcessedWindData } from "@/services/wind-speed-service";
import React, { useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

interface StationMapProps {
  stations: Station[];
  userLocation?: LocationData | null;
  onStationPress: (station: Station) => void;
  activeLayer?: "groundwater" | "temperature" | "soil" | "crop" | "wind";
  windData?: ProcessedWindData[];
}

export function StationMap({
  stations,
  userLocation,
  onStationPress,
  activeLayer = "groundwater",
  windData = [],
}: StationMapProps) {
  const { height } = Dimensions.get("window");
  const webRef = useRef<WebView | null>(null);
  const accuWeatherKey = process.env.EXPO_PUBLIC_ACCUWEATHER_API_KEY || "";

  const html = useMemo(() => {
    const initialCenter = {
      lat: userLocation?.latitude ?? 22.9734,
      lng: userLocation?.longitude ?? 78.6569,
      zoom: userLocation ? 8 : 5,
    };

    const payload = {
      initialCenter,
      user: userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : null,
      stations: stations.map((s) => ({
        id: s.id,
        name: s.name,
        district: s.district,
        state: s.state,
        lat: s.latitude,
        lng: s.longitude,
        currentLevel: s.currentLevel,
        oxygenLevel: s.oxygenLevel,
        temperature: s.temperature,
        week: s.week,
      })),
      rainfallData: [], // Keep for backward compatibility but empty
      windData: windData.map((w) => ({
        id: w.id,
        latitude: w.latitude,
        longitude: w.longitude,
        windSpeed: w.windSpeed,
        windDirection: w.windDirection,
        gustSpeed: w.gustSpeed,
        location: w.location,
        color: w.color,
        opacity: w.opacity,
        category: w.category,
        intensity: w.intensity,
        timestamp: w.timestamp,
      })),
      activeLayer,
      accuWeatherKey,
    };

    const dataScript = `window.__MAP_DATA__ = ${JSON.stringify(payload)};`;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
<style>
  html, body, #map { height: 100%; margin: 0; }
  
  /* Smooth transitions */
  .leaflet-marker-icon {
    transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out !important;
  }
  
  .leaflet-marker-icon:hover {
    transform: scale(1.15);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
  }
  
  /* Popup styling */
  .leaflet-popup-content-wrapper {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border: none;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }
  
  .leaflet-popup-tip {
    background: #ffffff;
  }
  
  .callout-title { 
    font-weight: 700; 
    font-size: 14px; 
    color: #1e293b;
    margin-bottom: 4px;
  }
  
  .callout-sub { 
    font-size: 12px; 
    color: #64748b; 
    margin-top: 2px;
    font-weight: 500;
  }
  
  .callout-meta { 
    font-size: 12px; 
    color: #0891b2; 
    margin-top: 6px;
    padding: 4px 0;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
  }

  /* Enhanced circle styling for heatmap effect */
  .leaflet-interactive {
    filter: blur(0px);
    transition: all 0.3s ease;
  }
  
  .leaflet-interactive:hover {
    filter: blur(0px) brightness(1.1);
    transform: scale(1.05);
  }
  
  /* Wind-specific styles */
  .wind-circle {
    animation: windPulse 2s infinite ease-in-out;
  }
  
  .wind-arrow {
    pointer-events: none;
    z-index: 1000;
  }
  
  @keyframes windPulse {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }
  
  /* Smooth popup animations */
  .leaflet-popup {
    animation: popupFadeIn 0.3s ease-out;
  }
  
  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .callout-meta:first-of-type {
    border-top: none;
    padding-top: 4px;
  }
  
  /* Smooth map transitions */
  .leaflet-container {
    background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script>
${dataScript}
const RN = window.ReactNativeWebView;
const data = window.__MAP_DATA__;
const map = L.map('map').setView([data.initialCenter.lat, data.initialCenter.lng], data.initialCenter.zoom);

// Base Layer (OSM)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Layers
let activeOverlay = null;

function updateLayer(layerName) {
  if (activeOverlay) {
    map.removeLayer(activeOverlay);
    activeOverlay = null;
  }

  if (layerName === 'temperature') {
    // Temperature Heatmap
    const heatPoints = data.stations
      .filter(s => s.temperature != null)
      .map(s => [s.lat, s.lng, s.temperature]); // [lat, lng, intensity]

    if (heatPoints.length > 0) {
      activeOverlay = L.heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        max: 40, // Assumed max temp for scaling intensity
        gradient: {
          0.4: 'blue',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);
    }
  } else if (layerName === 'wind') {
    // Wind speed data - display as animated circles with direction arrows
    if (data.windData && data.windData.length > 0) {
      data.windData.forEach(function(wind) {
        // Create main wind speed circle
        const circle = L.circle([wind.latitude, wind.longitude], {
          color: wind.color,
          fillColor: wind.color,
          fillOpacity: wind.opacity * 0.7,
          radius: Math.max(8000, wind.windSpeed * 400), // Scale radius based on wind speed
          weight: 2,
          className: 'wind-circle'
        });
        
        // Create wind direction arrow using DivIcon
        const arrowIcon = L.divIcon({
          html: '<div style="transform: rotate(' + wind.windDirection + 'deg); font-size: 16px; color: ' + wind.color + '; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">&uarr;</div>',
          className: 'wind-arrow',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        const arrowMarker = L.marker([wind.latitude, wind.longitude], {
          icon: arrowIcon,
          zIndexOffset: 1000
        });
        
        // Enhanced popup with wind information
        const popupContent = '<div style="font-family: system-ui; padding: 12px; min-width: 220px;">' +
          '<div style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px; display: flex; align-items: center;">' +
            '<span style="margin-right: 8px;">🌬️</span>' + wind.location +
          '</div>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">' +
            '<div style="background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center;">' +
              '<div style="font-size: 12px; color: #666; margin-bottom: 2px;">Wind Speed</div>' +
              '<div style="font-weight: bold; color: ' + wind.color + '; font-size: 16px;">' + wind.windSpeed + ' km/h</div>' +
            '</div>' +
            '<div style="background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center;">' +
              '<div style="font-size: 12px; color: #666; margin-bottom: 2px;">Direction</div>' +
              '<div style="font-weight: bold; color: #333; font-size: 16px;">' + wind.windDirection + '°</div>' +
            '</div>' +
          '</div>' +
          '<div style="background: linear-gradient(90deg, ' + wind.color + '20, ' + wind.color + '40); padding: 8px 12px; border-radius: 6px; text-align: center; margin-bottom: 8px;">' +
            '<div style="color: #333; font-size: 13px; font-weight: 600;">' + wind.intensity + ' Wind</div>' +
            '<div style="color: #666; font-size: 11px;">' + wind.category + '</div>' +
          '</div>' +
          '<div style="color: #888; font-size: 10px; text-align: center;">' +
            'Updated: ' + new Date(wind.timestamp).toLocaleTimeString() +
          '</div>' +
          '</div>';
        
        // Add popup to the circle
        circle.bindPopup(popupContent);
        
        // Add both circle and arrow to map
        circle.addTo(map);
        arrowMarker.addTo(map);
        
        // Store references for removal
        if (!activeOverlay) {
          activeOverlay = L.layerGroup();
          activeOverlay.addTo(map);
        }
        activeOverlay.addLayer(circle);
        activeOverlay.addLayer(arrowMarker);
      });
    }
  } else if (layerName === 'accuweather-rainfall' && data.accuWeatherKey) {
    // AccuWeather Radar (kept as fallback)
    activeOverlay = L.tileLayer(
      'https://api.accuweather.com/maps/v1/radar/{z}/{x}/{y}.png?apikey=' + data.accuWeatherKey, 
      {
        opacity: 0.6,
        attribution: 'Weather &copy; AccuWeather'
      }
    ).addTo(map);
  }
}

updateLayer(data.activeLayer);

function stationPopupHtml(s) {
  var parts = [];
  parts.push('<div>');
  parts.push('<div class="callout-title">' + (s.name || '') + '</div>');
  var sub = (s.district || '') + (s.state ? ((s.district ? ', ' : '') + s.state) : '');
  parts.push('<div class="callout-sub">' + sub + '</div>');
  parts.push('<div class="callout-meta">Water: ' + Number(s.currentLevel || 0).toFixed(1) + 'm</div>');
  if (s.oxygenLevel != null) parts.push('<div class="callout-meta">Oxygen: ' + s.oxygenLevel + '</div>');
  if (s.temperature != null) parts.push('<div class="callout-meta">Temperature: ' + s.temperature + '°C</div>');
  if (s.week != null) parts.push('<div class="callout-meta">Week: ' + s.week + '</div>');
  parts.push('</div>');
  return parts.join('');
}

// User marker
if (data.user) {
  const userIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%230891b2"><circle cx="12" cy="12" r="8" fill="%230891b2"/><circle cx="12" cy="12" r="5" fill="white"/></svg>',
    iconSize: [48, 48], iconAnchor: [24, 24]
  });
  L.marker([data.user.lat, data.user.lng], { icon: userIcon }).addTo(map).bindPopup('Your Location');
  // Auto-zoom to user location
  map.setView([data.user.lat, data.user.lng], 12);
}

// Function to get marker color based on water level
function getMarkerColor(level) {
  // Thresholds for water level status
  // Green: < 3.5m (good water level)
  // Yellow: 3.5m - 8m (moderate water level)
  // Red: > 8m (critical water level)
  if (level < 3.5) return '#22c55e'; // Green
  if (level <= 8) return '#eab308';  // Yellow
  return '#ef4444'; // Red
}

// Function to create colored marker icon
function createColoredMarker(color) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="' + color + '"><path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 8.5c-1.379 0-2.5-1.121-2.5-2.5S10.621 5.5 12 5.5s2.5 1.121 2.5 2.5S13.379 10.5 12 10.5z"/></svg>';
  return L.icon({
    iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg),
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
}

// Station markers
const markers = [];
(data.stations || []).forEach(s => {
  const color = getMarkerColor(s.currentLevel);
  const icon = createColoredMarker(color);
  const m = L.marker([s.lat, s.lng], { icon: icon }).addTo(map).bindPopup(stationPopupHtml(s));
  m.on('click', () => {
    RN && RN.postMessage(JSON.stringify({ type: 'stationTap', id: s.id }));
  });
  markers.push(m);
});

// Notify RN when map region changes
function notifyBounds() {
  const b = map.getBounds();
  RN && RN.postMessage(JSON.stringify({ type: 'region', bounds: {
    north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest()
  }, zoom: map.getZoom(), center: map.getCenter() }));
}
map.on('moveend', notifyBounds);
setTimeout(notifyBounds, 0);
</script>
</body>
</html>`;
  }, [stations, userLocation, activeLayer]);

  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data || "{}");
      if (msg.type === "stationTap") {
        const st = stations.find((s) => s.id === msg.id);
        if (st) onStationPress(st);
      }
      // msg.type === 'region' can be used if you need bounds on RN side
    } catch {}
  };

  return (
    <View style={[styles.container, { height: height * 0.5 }]}>
      <WebView
        ref={(r) => {
          webRef.current = r;
        }}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e0f2fe",
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
});
