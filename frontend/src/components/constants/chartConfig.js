// Parameter display names, units, and colors
export const parameterConfig = {
    pm25: { name: 'PM2.5', unit: 'µg/m³', color: '#FF3366', yAxis: 'left' },
    pm10: { name: 'PM10', unit: 'µg/m³', color: '#FF8C42', yAxis: 'left' },
    no2: { name: 'NO2', unit: 'ppb', color: '#7B61FF', yAxis: 'left' },
    co: { name: 'CO', unit: 'ppm', color: '#FFD700', yAxis: 'left' },
    so2: { name: 'SO2', unit: 'ppb', color: '#00CFFF', yAxis: 'left' },
    o3: { name: 'O3', unit: 'ppb', color: '#FF69B4', yAxis: 'left' },
    no: { name: 'NO', unit: 'ppb', color: '#B22222', yAxis: 'left' },
    nox: { name: 'NOx', unit: 'ppb', color: '#FF4500', yAxis: 'left' },
    temperature: { name: 'Temperature', unit: '°C', color: '#00FF66', yAxis: 'right' },
    relativehumidity: { name: 'Humidity', unit: '%', color: '#4169E1', yAxis: 'right' },
    wind_speed: { name: 'Wind Speed', unit: 'm/s', color: '#9370DB', yAxis: 'left' }
};

// Default selected parameters
export const defaultSelectedParams = {
    pm25: true,
    pm10: true,
    no2: true,
    co: false,
    so2: false,
    o3: false,
    no: false,
    nox: false,
    temperature: true,
    relativehumidity: false,
    wind_speed: false
};