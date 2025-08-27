import { AIChatterPlugin, PluginCommand, PluginCommandResult } from '../PluginInterface';

// Weather Plugin - Example plugin for AI Chatter v1.2.0
export class WeatherPlugin implements AIChatterPlugin {
    id = 'weather';
    name = 'Weather Plugin';
    version = '1.0.0';
    description = 'Get weather information for any location';
    author = 'AI Chatter Team';

    commands: PluginCommand[] = [
        {
            name: 'weather',
            description: 'Get current weather for a location',
            usage: '/weather <city> [country]',
            examples: [
                '/weather London',
                '/weather New York US',
                '/weather Tokyo JP'
            ],
            handler: this.handleWeatherCommand.bind(this),
            requiresAuth: false,
            adminOnly: false
        },
        {
            name: 'forecast',
            description: 'Get weather forecast for a location',
            usage: '/forecast <city> [days]',
            examples: [
                '/forecast London 5',
                '/forecast Paris 3'
            ],
            handler: this.handleForecastCommand.bind(this),
            requiresAuth: false,
            adminOnly: false
        }
    ];

    async onActivate(): Promise<void> {
        console.log('[WeatherPlugin] Plugin activated');
    }

    async onDeactivate(): Promise<void> {
        console.log('[WeatherPlugin] Plugin deactivated');
    }

    private async handleWeatherCommand(args: string[], username: string, chatId: string): Promise<PluginCommandResult> {
        try {
            if (args.length === 0) {
                return {
                    success: false,
                    message: '❌ City is required',
                    error: 'Usage: /weather <city> [country]'
                };
            }

            const city = args[0];
            const country = args[1] || '';

            // Simulate weather API call
            const weather = await this.getWeatherData(city, country);

            return {
                success: true,
                message: `🌤️ **Weather for ${city}${country ? `, ${country}` : ''}**\n\n` +
                         `**Temperature**: ${weather.temperature}°C\n` +
                         `**Condition**: ${weather.condition}\n` +
                         `**Humidity**: ${weather.humidity}%\n` +
                         `**Wind**: ${weather.wind} km/h\n\n` +
                         `*Data provided by Weather Plugin*`,
                data: weather
            };

        } catch (error) {
            return {
                success: false,
                message: `❌ Error getting weather for ${args[0]}`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private async handleForecastCommand(args: string[], username: string, chatId: string): Promise<PluginCommandResult> {
        try {
            if (args.length === 0) {
                return {
                    success: false,
                    message: '❌ City is required',
                    error: 'Usage: /forecast <city> [days]'
                };
            }

            const city = args[0];
            const days = parseInt(args[1]) || 3;

            if (days < 1 || days > 7) {
                return {
                    success: false,
                    message: '❌ Days must be between 1 and 7',
                    error: 'Invalid number of days'
                };
            }

            // Simulate forecast API call
            const forecast = await this.getForecastData(city, days);

            let message = `📅 **${days}-Day Forecast for ${city}**\n\n`;
            forecast.forEach((day, index) => {
                message += `**Day ${index + 1}**: ${day.date}\n`;
                message += `🌡️ ${day.temperature}°C | 💧 ${day.condition}\n\n`;
            });

            return {
                success: true,
                message: message + '*Data provided by Weather Plugin*',
                data: forecast
            };

        } catch (error) {
            return {
                success: false,
                message: `❌ Error getting forecast for ${args[0]}`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // Simulate weather API
    private async getWeatherData(city: string, country: string): Promise<any> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Partly Cloudy'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

        return {
            city,
            country,
            temperature: Math.floor(Math.random() * 30) - 5, // -5 to 25°C
            condition: randomCondition,
            humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
            wind: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
            timestamp: new Date().toISOString()
        };
    }

    // Simulate forecast API
    private async getForecastData(city: string, days: number): Promise<any[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const forecast = [];
        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Partly Cloudy'];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            forecast.push({
                date: date.toLocaleDateString(),
                temperature: Math.floor(Math.random() * 30) - 5,
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                humidity: Math.floor(Math.random() * 40) + 40,
                wind: Math.floor(Math.random() * 30) + 5
            });
        }

        return forecast;
    }
}
