import { WeatherPlugin } from '../WeatherPlugin';
import { PluginCommandResult } from '../../PluginInterface';

describe('WeatherPlugin', () => {
  let weatherPlugin: WeatherPlugin;

  beforeEach(() => {
    weatherPlugin = new WeatherPlugin();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plugin Structure', () => {
    it('should have correct plugin metadata', () => {
      expect(weatherPlugin.id).toBe('weather');
      expect(weatherPlugin.name).toBe('Weather Plugin');
      expect(weatherPlugin.version).toBe('1.0.0');
      expect(weatherPlugin.description).toBe('Get weather information for any location');
      expect(weatherPlugin.author).toBe('AI Chatter Team');
    });

    it('should have two commands', () => {
      expect(weatherPlugin.commands).toHaveLength(2);
    });

    it('should have weather command', () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      expect(weatherCommand).toBeDefined();
      expect(weatherCommand?.description).toBe('Get current weather for a location');
      expect(weatherCommand?.usage).toBe('/weather <city> [country]');
      expect(weatherCommand?.examples).toEqual([
        '/weather London',
        '/weather New York US',
        '/weather Tokyo JP'
      ]);
    });

    it('should have forecast command', () => {
      const forecastCommand = weatherPlugin.commands.find(cmd => cmd.name === 'forecast');
      expect(forecastCommand).toBeDefined();
      expect(forecastCommand?.description).toBe('Get weather forecast for a location');
      expect(forecastCommand?.usage).toBe('/forecast <city> [days]');
      expect(forecastCommand?.examples).toEqual([
        '/forecast London 5',
        '/forecast Paris 3'
      ]);
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should activate successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await weatherPlugin.onActivate?.();
      
      expect(consoleSpy).toHaveBeenCalledWith('[WeatherPlugin] Plugin activated');
      consoleSpy.mockRestore();
    });

    it('should deactivate successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await weatherPlugin.onDeactivate?.();
      
      expect(consoleSpy).toHaveBeenCalledWith('[WeatherPlugin] Plugin deactivated');
      consoleSpy.mockRestore();
    });
  });

  describe('Weather Command', () => {
    let weatherCommand: any;

    beforeEach(() => {
      weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
    });

    it('should handle weather command with city only', async () => {
      const result = await weatherCommand.handler(['London'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Weather for London');
      expect(result.message).toContain('Temperature');
      expect(result.message).toContain('Condition');
      expect(result.message).toContain('Humidity');
      expect(result.message).toContain('Wind');
      expect(result.data).toBeDefined();
    });

    it('should handle weather command with city and country', async () => {
      const result = await weatherCommand.handler(['New', 'York', 'US'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Weather for New, York');
      expect(result.data.city).toBe('New York');
      expect(result.data.country).toBe('US');
    });

    it('should handle weather command with no arguments', async () => {
      const result = await weatherCommand.handler([], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('City is required');
      expect(result.error).toBe('Usage: /weather <city> [country]');
    });

    it('should handle weather command errors gracefully', async () => {
      // Mock the getWeatherData method to throw an error
      const originalGetWeatherData = (weatherPlugin as any).getWeatherData;
      (weatherPlugin as any).getWeatherData = jest.fn().mockRejectedValue(new Error('API Error'));

      const result = await weatherCommand.handler(['London'], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error getting weather for London');
      expect(result.error).toBe('API Error');

      // Restore original method
      (weatherPlugin as any).getWeatherData = originalGetWeatherData;
    });

    it('should return weather data with all required fields', async () => {
      const result = await weatherCommand.handler(['Tokyo'], 'testuser', '123');

      expect(result.data).toHaveProperty('city');
      expect(result.data).toHaveProperty('country');
      expect(result.data).toHaveProperty('temperature');
      expect(result.data).toHaveProperty('condition');
      expect(result.data).toHaveProperty('humidity');
      expect(result.data).toHaveProperty('wind');
      expect(result.data).toHaveProperty('timestamp');

      expect(typeof result.data.temperature).toBe('number');
      expect(typeof result.data.humidity).toBe('number');
      expect(typeof result.data.wind).toBe('number');
      expect(typeof result.data.condition).toBe('string');
    });
  });

  describe('Forecast Command', () => {
    let forecastCommand: any;

    beforeEach(() => {
      forecastCommand = weatherPlugin.commands.find(cmd => cmd.name === 'forecast');
    });

    it('should handle forecast command with city and days', async () => {
      const result = await forecastCommand.handler(['Paris', '5'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('5-Day Forecast for Paris');
      expect(result.message).toContain('Day 1');
      expect(result.message).toContain('Day 5');
      expect(result.data).toHaveLength(5);
    });

    it('should handle forecast command with city only (default 3 days)', async () => {
      const result = await forecastCommand.handler(['London'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('3-Day Forecast for London');
      expect(result.data).toHaveLength(3);
    });

    it('should handle forecast command with no arguments', async () => {
      const result = await forecastCommand.handler([], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('City is required');
      expect(result.error).toBe('Usage: /forecast <city> [days]');
    });

    it('should handle forecast command with invalid days', async () => {
      const result = await forecastCommand.handler(['London', '10'], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Days must be between 1 and 7');
      expect(result.error).toBe('Invalid number of days');
    });

    it('should handle forecast command with zero days', async () => {
      const result = await forecastCommand.handler(['London', '0'], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Days must be between 1 and 7');
    });

    it('should handle forecast command with negative days', async () => {
      const result = await forecastCommand.handler(['London', '-1'], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Days must be between 1 and 7');
    });

    it('should return forecast data with correct structure', async () => {
      const result = await forecastCommand.handler(['Tokyo', '4'], 'testuser', '123');

      expect(result.data).toHaveLength(4);
      
      result.data.forEach((day: any, index: number) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('temperature');
        expect(day).toHaveProperty('condition');
        expect(day).toHaveProperty('humidity');
        expect(day).toHaveProperty('wind');
        
        expect(typeof day.date).toBe('string');
        expect(typeof day.temperature).toBe('number');
        expect(typeof day.condition).toBe('string');
        expect(typeof day.humidity).toBe('number');
        expect(typeof day.wind).toBe('number');
      });
    });
  });

  describe('Weather Data Generation', () => {
    it('should generate weather data with realistic ranges', async () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      const result = await weatherCommand!.handler(['TestCity'], 'testuser', '123');

      const { temperature, humidity, wind } = result.data;

      // Temperature should be between -5 and 25°C
      expect(temperature).toBeGreaterThanOrEqual(-5);
      expect(temperature).toBeLessThanOrEqual(25);

      // Humidity should be between 40% and 80%
      expect(humidity).toBeGreaterThanOrEqual(40);
      expect(humidity).toBeLessThanOrEqual(80);

      // Wind should be between 5 and 35 km/h
      expect(wind).toBeGreaterThanOrEqual(5);
      expect(wind).toBeLessThanOrEqual(35);
    });

    it('should generate forecast data with sequential dates', async () => {
      const forecastCommand = weatherPlugin.commands.find(cmd => cmd.name === 'forecast');
              const result = await forecastCommand!.handler(['TestCity', '3'], 'testuser', '123');

      const dates = result.data.map((day: any) => new Date(day.date));
      
      // Check that dates are sequential
      for (let i = 1; i < dates.length; i++) {
        const currentDate = dates[i];
        const previousDate = dates[i - 1];
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(1);
      }
    });

    it('should generate different weather conditions', async () => {
      const conditions = new Set();
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');

      // Generate multiple weather requests to get different conditions
      for (let i = 0; i < 10; i++) {
        const result = await weatherCommand!.handler([`City${i}`], 'testuser', '123');
        conditions.add(result.data.condition);
      }

      // Should have multiple different conditions
      expect(conditions.size).toBeGreaterThan(1);
    });
  });

  describe('Command Permissions', () => {
    it('should not require authentication', () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      const forecastCommand = weatherPlugin.commands.find(cmd => cmd.name === 'forecast');

      expect(weatherCommand?.requiresAuth).toBe(false);
      expect(forecastCommand?.requiresAuth).toBe(false);
    });

    it('should not require admin privileges', () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      const forecastCommand = weatherPlugin.commands.find(cmd => cmd.name === 'forecast');

      expect(weatherCommand?.adminOnly).toBe(false);
      expect(forecastCommand?.adminOnly).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed city names gracefully', async () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      const result = await weatherCommand!.handler([''], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('City is required');
    });

    it('should handle special characters in city names', async () => {
      const weatherCommand = weatherPlugin.commands.find(cmd => cmd.name === 'weather');
      const result = await weatherCommand!.handler(['São Paulo'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Weather for São Paulo');
    });
  });
});
