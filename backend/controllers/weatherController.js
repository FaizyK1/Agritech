// Helper to calculate agricultural advisories based on meteorological metrics
const calculateAgriAdvisory = (currentTemp, humidity, windSpeed, rainProb) => {
  const advisories = [];

  // Spraying Conditions
  if (windSpeed < 15 && rainProb < 25) {
    advisories.push({
      type: 'Spray Window',
      status: 'Optimal',
      badgeClass: 'success',
      message: 'Favorable condition for pesticide and foliar micronutrient spraying. Low drift risk.'
    });
  } else if (windSpeed >= 15) {
    advisories.push({
      type: 'Spray Window',
      status: 'High Drift Warning',
      badgeClass: 'warning',
      message: `Wind speed is ${windSpeed} km/h. Postpone foliar spraying to prevent chemical drift.`
    });
  } else {
    advisories.push({
      type: 'Spray Window',
      status: 'Rain Risk',
      badgeClass: 'danger',
      message: 'High chance of precipitation. Avoid spraying; wash-off likely within 6 hours.'
    });
  }

  // Irrigation Advisory
  if (rainProb > 50) {
    advisories.push({
      type: 'Irrigation Management',
      status: 'Hold Irrigation',
      badgeClass: 'info',
      message: 'Substantial rain anticipated. Postpone tube-well and flood irrigation to prevent waterlogging.'
    });
  } else if (currentTemp > 34 && humidity < 40) {
    advisories.push({
      type: 'Irrigation Management',
      status: 'Irrigation Required',
      badgeClass: 'warning',
      message: 'High evapotranspiration rate. Apply light drip irrigation during early morning or sunset.'
    });
  } else {
    advisories.push({
      type: 'Irrigation Management',
      status: 'Normal Schedule',
      badgeClass: 'success',
      message: 'Soil moisture transpiration balance is steady. Maintain standard rotational schedule.'
    });
  }

  // Disease Risk
  if (humidity > 78 && currentTemp >= 20 && currentTemp <= 28) {
    advisories.push({
      type: 'Disease Surveillance',
      status: 'Elevated Fungal Risk',
      badgeClass: 'danger',
      message: 'High relative humidity combined with moderate temperature accelerates fungal spore germination (e.g., rust, blight).'
    });
  } else {
    advisories.push({
      type: 'Disease Surveillance',
      status: 'Low Pathogen Threat',
      badgeClass: 'success',
      message: 'Atmospheric conditions do not favor rapid sporulation.'
    });
  }

  return advisories;
};

// @desc    Get live agricultural weather forecast
// @route   GET /api/weather
// @access  Public
export const getWeatherForecast = async (req, res) => {
  const lat = req.query.lat || 30.9010; // Default Ludhiana / Punjab
  const lon = req.query.lon || 75.8573;
  const locationName = req.query.city || 'Punjab Central Agro-Zone';

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();

    const currentTemp = Math.round(data.current?.temperature_2m ?? 26);
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 55);
    const windSpeed = Math.round(data.current?.wind_speed_10m ?? 8);
    const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 10;

    // Daily 7-day forecast mapping
    const dailyForecast = (data.daily?.time || []).map((dateStr, idx) => ({
      date: dateStr,
      maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
      minTemp: Math.round(data.daily.temperature_2m_min[idx]),
      rainProb: data.daily.precipitation_probability_max[idx],
      maxWind: Math.round(data.daily.wind_speed_10m_max[idx]),
      weatherCode: data.daily.weather_code[idx]
    }));

    return res.json({
      success: true,
      isLiveData: true,
      dataSource: 'Open-Meteo Live Global Meteorological API',
      timestamp: new Date(),
      location: {
        name: locationName,
        latitude: Number(lat),
        longitude: Number(lon)
      },
      current: {
        temperature: currentTemp,
        apparentTemp: Math.round(data.current?.apparent_temperature ?? currentTemp),
        humidity,
        windSpeed,
        windDirection: data.current?.wind_direction_10m ?? 180,
        precipitation: data.current?.precipitation ?? 0,
        rainProbability: rainProb,
        weatherCode: data.current?.weather_code ?? 0
      },
      dailyForecast,
      advisories: calculateAgriAdvisory(currentTemp, humidity, windSpeed, rainProb)
    });
  } catch (error) {
    console.warn(`[Live Weather Fetch Notice]: ${error.message} - Serving calibrated agro-demo meteorological telemetry`);

    // High fidelity offline/fallback mode with explicit flag distinguishing demo from live
    const demoTemp = 28;
    const demoHumidity = 58;
    const demoWind = 11;
    const demoRain = 15;

    return res.json({
      success: true,
      isLiveData: false,
      dataSource: 'AgriTech Calibrated Demo Meteorological Station (Offline Mode)',
      notice: 'Live API connection unavailable or timed out; displaying realistic demo weather data for evaluation.',
      timestamp: new Date(),
      location: {
        name: locationName,
        latitude: Number(lat),
        longitude: Number(lon)
      },
      current: {
        temperature: demoTemp,
        apparentTemp: 29,
        humidity: demoHumidity,
        windSpeed: demoWind,
        windDirection: 145,
        precipitation: 0,
        rainProbability: demoRain,
        weatherCode: 1
      },
      dailyForecast: [
        { date: 'Today', maxTemp: 31, minTemp: 19, rainProb: 15, maxWind: 12, weatherCode: 1 },
        { date: 'Tomorrow', maxTemp: 32, minTemp: 20, rainProb: 20, maxWind: 10, weatherCode: 2 },
        { date: 'Day 3', maxTemp: 29, minTemp: 18, rainProb: 65, maxWind: 18, weatherCode: 61 },
        { date: 'Day 4', maxTemp: 27, minTemp: 17, rainProb: 40, maxWind: 14, weatherCode: 3 },
        { date: 'Day 5', maxTemp: 29, minTemp: 18, rainProb: 10, maxWind: 9, weatherCode: 1 },
        { date: 'Day 6', maxTemp: 30, minTemp: 19, rainProb: 5, maxWind: 8, weatherCode: 0 },
        { date: 'Day 7', maxTemp: 32, minTemp: 20, rainProb: 10, maxWind: 11, weatherCode: 0 }
      ],
      advisories: calculateAgriAdvisory(demoTemp, demoHumidity, demoWind, demoRain)
    });
  }
};
