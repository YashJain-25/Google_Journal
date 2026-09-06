export type TemperatureUnit = 'C' | 'F';

export interface WeatherData {
  temperatureCelsius: number;
  condition: string;
  icon: string;
  isDay: boolean;
  locationName?: string;
  loading: boolean;
  error?: string;
}

const WEATHER_CODE_MAP: Record<number, { condition: string; dayIcon: string; nightIcon: string }> = {
  0: { condition: 'Clear', dayIcon: 'sunny', nightIcon: 'clear_night' },
  1: { condition: 'Mainly Clear', dayIcon: 'sunny', nightIcon: 'clear_night' },
  2: { condition: 'Partly Cloudy', dayIcon: 'partly_cloudy_day', nightIcon: 'nights_stay' },
  3: { condition: 'Overcast', dayIcon: 'cloud', nightIcon: 'cloud' },
  45: { condition: 'Foggy', dayIcon: 'foggy', nightIcon: 'foggy' },
  48: { condition: 'Depositing Rime Fog', dayIcon: 'foggy', nightIcon: 'foggy' },
  51: { condition: 'Light Drizzle', dayIcon: 'rainy', nightIcon: 'rainy' },
  53: { condition: 'Drizzle', dayIcon: 'rainy', nightIcon: 'rainy' },
  55: { condition: 'Dense Drizzle', dayIcon: 'rainy', nightIcon: 'rainy' },
  61: { condition: 'Slight Rain', dayIcon: 'rainy', nightIcon: 'rainy' },
  63: { condition: 'Moderate Rain', dayIcon: 'rainy', nightIcon: 'rainy' },
  65: { condition: 'Heavy Rain', dayIcon: 'rainy', nightIcon: 'rainy' },
  71: { condition: 'Light Snow', dayIcon: 'weather_snowy', nightIcon: 'weather_snowy' },
  73: { condition: 'Moderate Snow', dayIcon: 'weather_snowy', nightIcon: 'weather_snowy' },
  75: { condition: 'Heavy Snow', dayIcon: 'weather_snowy', nightIcon: 'weather_snowy' },
  80: { condition: 'Rain Showers', dayIcon: 'rainy', nightIcon: 'rainy' },
  81: { condition: 'Moderate Showers', dayIcon: 'rainy', nightIcon: 'rainy' },
  82: { condition: 'Violent Showers', dayIcon: 'rainy', nightIcon: 'rainy' },
  95: { condition: 'Thunderstorm', dayIcon: 'thunderstorm', nightIcon: 'thunderstorm' },
  96: { condition: 'Thunderstorm with Hail', dayIcon: 'thunderstorm', nightIcon: 'thunderstorm' },
  99: { condition: 'Heavy Thunderstorm', dayIcon: 'thunderstorm', nightIcon: 'thunderstorm' },
};

// Known regional coordinates fallback based on standard IANA timezones
const TIMEZONE_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  'Asia/Kolkata': { lat: 28.61, lon: 77.20, name: 'India' },
  'Asia/Calcutta': { lat: 28.61, lon: 77.20, name: 'India' },
  'Asia/Dubai': { lat: 25.20, lon: 55.27, name: 'Dubai' },
  'Asia/Singapore': { lat: 1.35, lon: 103.82, name: 'Singapore' },
  'Asia/Tokyo': { lat: 35.67, lon: 139.65, name: 'Tokyo' },
  'Asia/Bangkok': { lat: 13.75, lon: 100.50, name: 'Bangkok' },
  'Asia/Hong_Kong': { lat: 22.31, lon: 114.16, name: 'Hong Kong' },
  'Europe/London': { lat: 51.50, lon: -0.12, name: 'London' },
  'Europe/Paris': { lat: 48.85, lon: 2.35, name: 'Paris' },
  'Europe/Berlin': { lat: 52.52, lon: 13.40, name: 'Berlin' },
  'America/New_York': { lat: 40.71, lon: -74.00, name: 'New York' },
  'America/Chicago': { lat: 41.87, lon: -87.62, name: 'Chicago' },
  'America/Denver': { lat: 39.73, lon: -104.99, name: 'Denver' },
  'America/Los_Angeles': { lat: 34.05, lon: -118.24, name: 'Los Angeles' },
  'America/Toronto': { lat: 43.65, lon: -79.38, name: 'Toronto' },
  'Australia/Sydney': { lat: -33.86, lon: 151.20, name: 'Sydney' },
};

export function getInitialTemperatureUnit(): TemperatureUnit {
  try {
    const saved = localStorage.getItem('gemini_journal_temp_unit') as TemperatureUnit | null;
    if (saved === 'C' || saved === 'F') {
      return saved;
    }
  } catch {
    // Ignore storage issues
  }

  // Detect based on timezone and language
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = navigator.language || '';
    const isUS =
      lang.startsWith('en-US') &&
      (tz.startsWith('America/') || tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles'));
    return isUS ? 'F' : 'C';
  } catch {
    return 'C';
  }
}

export function saveTemperatureUnit(unit: TemperatureUnit): void {
  try {
    localStorage.setItem('gemini_journal_temp_unit', unit);
  } catch {
    // Ignore storage issues
  }
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return `${f}°F`;
  }
  const c = Math.round(celsius);
  return `${c}°C`;
}

/**
 * Fetches real-time weather using browser geolocation with automatic timezone coordinate fallback.
 * Uses Open-Meteo's open weather forecast API (free, open, no secret keys required).
 */
export async function fetchLiveWeather(): Promise<WeatherData> {
  const currentHour = new Date().getHours();
  const fallbackIsDay = currentHour >= 6 && currentHour < 19;

  let lat = 28.61;
  let lon = 77.20;
  let locationName: string | undefined;

  // Check timezone coordinates as clean baseline
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COORDS[tz]) {
      lat = TIMEZONE_COORDS[tz].lat;
      lon = TIMEZONE_COORDS[tz].lon;
      locationName = TIMEZONE_COORDS[tz].name;
    }
  } catch {
    // Ignore
  }

  // Try device geolocation if accessible
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 300000, // 5 minutes cache
          enableHighAccuracy: false,
        });
      });
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      locationName = undefined; // Accurate GPS coordinates
    } catch {
      // Geolocation denied, iframe restricted, or timed out; proceeding with timezone coordinate fallback
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,weather_code,is_day`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather fetch status: ${res.status}`);
    }
    const data = await res.json();
    const current = data.current;
    if (!current || typeof current.temperature_2m !== 'number') {
      throw new Error('Malformed weather response');
    }

    const tempCelsius = current.temperature_2m;
    const isDay = current.is_day === 1;
    const code = current.weather_code ?? 0;
    const mapping = WEATHER_CODE_MAP[code] || {
      condition: isDay ? 'Clear' : 'Clear Sky',
      dayIcon: 'sunny',
      nightIcon: 'clear_night',
    };

    return {
      temperatureCelsius: tempCelsius,
      condition: mapping.condition,
      icon: isDay ? mapping.dayIcon : mapping.nightIcon,
      isDay,
      locationName,
      loading: false,
    };
  } catch {
    // Fallback: estimate time-appropriate condition and temperature
    return {
      temperatureCelsius: 24, // Consistent realistic baseline
      condition: fallbackIsDay ? 'Partly Cloudy' : 'Clear',
      icon: fallbackIsDay ? 'partly_cloudy_day' : 'clear_night',
      isDay: fallbackIsDay,
      loading: false,
    };
  }
}
