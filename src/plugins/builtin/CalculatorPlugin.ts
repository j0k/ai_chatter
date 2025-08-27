import { AIChatterPlugin, PluginCommand, PluginCommandResult } from '../PluginInterface';

// Calculator Plugin - Example plugin for AI Chatter v1.2.0
export class CalculatorPlugin implements AIChatterPlugin {
    id = 'calculator';
    name = 'Calculator Plugin';
    version = '1.0.0';
    description = 'Perform mathematical calculations and conversions';
    author = 'AI Chatter Team';

    commands: PluginCommand[] = [
        {
            name: 'calc',
            description: 'Perform mathematical calculations',
            usage: '/calc <expression>',
            examples: [
                '/calc 2 + 2',
                '/calc 10 * 5',
                '/calc sqrt(16)',
                '/calc 2^8'
            ],
            handler: this.handleCalcCommand.bind(this),
            requiresAuth: false,
            adminOnly: false
        },
        {
            name: 'convert',
            description: 'Convert between units',
            usage: '/convert <value> <from_unit> to <to_unit>',
            examples: [
                '/convert 100 USD to EUR',
                '/convert 32 F to C',
                '/convert 1 mile to km'
            ],
            handler: this.handleConvertCommand.bind(this),
            requiresAuth: false,
            adminOnly: false
        }
    ];

    async onActivate(): Promise<void> {
        console.log('[CalculatorPlugin] Plugin activated');
    }

    async onDeactivate(): Promise<void> {
        console.log('[CalculatorPlugin] Plugin deactivated');
    }

    private async handleCalcCommand(args: string[], username: string, chatId: string): Promise<PluginCommandResult> {
        try {
            if (args.length === 0) {
                return {
                    success: false,
                    message: '❌ Expression is required',
                    error: 'Usage: /calc <expression>'
                };
            }

            const expression = args.join(' ');
            const result = this.evaluateExpression(expression);

            if (result === null) {
                return {
                    success: false,
                    message: `❌ Invalid expression: ${expression}`,
                    error: 'Expression could not be evaluated'
                };
            }

            return {
                success: true,
                message: `🧮 **Calculator Result**\n\n` +
                         `**Expression**: \`${expression}\`\n` +
                         `**Result**: \`${result}\`\n\n` +
                         `*Calculated by Calculator Plugin*`,
                data: { expression, result }
            };

        } catch (error) {
            return {
                success: false,
                message: `❌ Error calculating: ${args.join(' ')}`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private async handleConvertCommand(args: string[], username: string, chatId: string): Promise<PluginCommandResult> {
        try {
            if (args.length < 4) {
                return {
                    success: false,
                    message: '❌ Invalid conversion format',
                    error: 'Usage: /convert <value> <from_unit> to <to_unit>'
                };
            }

            const value = parseFloat(args[0]);
            const fromUnit = args[1].toLowerCase();
            const toUnit = args[3].toLowerCase();

            if (isNaN(value)) {
                return {
                    success: false,
                    message: '❌ Invalid value',
                    error: 'Value must be a number'
                };
            }

            const result = this.convertUnit(value, fromUnit, toUnit);

            if (result === null) {
                return {
                    success: false,
                    message: `❌ Conversion not supported: ${fromUnit} to ${toUnit}`,
                    error: 'Unsupported unit conversion'
                };
            }

            return {
                success: true,
                message: `🔄 **Unit Conversion**\n\n` +
                         `**${value} ${fromUnit}** = **${result.toFixed(4)} ${toUnit}**\n\n` +
                         `*Converted by Calculator Plugin*`,
                data: { from: { value, unit: fromUnit }, to: { value: result, unit: toUnit } }
            };

        } catch (error) {
            return {
                success: false,
                message: `❌ Error converting: ${args.join(' ')}`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // Simple expression evaluator
    private evaluateExpression(expression: string): number | null {
        try {
            // Remove spaces and convert to lowercase
            const cleanExpr = expression.replace(/\s/g, '').toLowerCase();
            
            // Handle basic operations
            if (cleanExpr.includes('+')) {
                const parts = cleanExpr.split('+');
                return parseFloat(parts[0]) + parseFloat(parts[1]);
            }
            
            if (cleanExpr.includes('-')) {
                const parts = cleanExpr.split('-');
                return parseFloat(parts[0]) - parseFloat(parts[1]);
            }
            
            if (cleanExpr.includes('*')) {
                const parts = cleanExpr.split('*');
                return parseFloat(parts[0]) * parseFloat(parts[1]);
            }
            
            if (cleanExpr.includes('/')) {
                const parts = cleanExpr.split('/');
                return parseFloat(parts[0]) / parseFloat(parts[1]);
            }
            
            if (cleanExpr.includes('^')) {
                const parts = cleanExpr.split('^');
                return Math.pow(parseFloat(parts[0]), parseFloat(parts[1]));
            }
            
            // Handle functions
            if (cleanExpr.startsWith('sqrt(') && cleanExpr.endsWith(')')) {
                const num = parseFloat(cleanExpr.slice(5, -1));
                return Math.sqrt(num);
            }
            
            if (cleanExpr.startsWith('sin(') && cleanExpr.endsWith(')')) {
                const num = parseFloat(cleanExpr.slice(4, -1));
                return Math.sin(num * Math.PI / 180); // Convert to radians
            }
            
            if (cleanExpr.startsWith('cos(') && cleanExpr.endsWith(')')) {
                const num = parseFloat(cleanExpr.slice(4, -1));
                return Math.cos(num * Math.PI / 180);
            }
            
            // Try to parse as a single number
            const result = parseFloat(cleanExpr);
            return isNaN(result) ? null : result;
            
        } catch (error) {
            return null;
        }
    }

    // Unit conversion
    private convertUnit(value: number, fromUnit: string, toUnit: string): number | null {
        // Temperature conversions
        if (fromUnit === 'c' && toUnit === 'f') {
            return (value * 9/5) + 32;
        }
        if (fromUnit === 'f' && toUnit === 'c') {
            return (value - 32) * 5/9;
        }
        if (fromUnit === 'c' && toUnit === 'k') {
            return value + 273.15;
        }
        if (fromUnit === 'k' && toUnit === 'c') {
            return value - 273.15;
        }
        
        // Distance conversions
        if (fromUnit === 'km' && toUnit === 'mile') {
            return value * 0.621371;
        }
        if (fromUnit === 'mile' && toUnit === 'km') {
            return value * 1.60934;
        }
        if (fromUnit === 'm' && toUnit === 'ft') {
            return value * 3.28084;
        }
        if (fromUnit === 'ft' && toUnit === 'm') {
            return value * 0.3048;
        }
        
        // Currency conversions (simplified)
        if (fromUnit === 'usd' && toUnit === 'eur') {
            return value * 0.85; // Approximate rate
        }
        if (fromUnit === 'eur' && toUnit === 'usd') {
            return value * 1.18;
        }
        
        // Weight conversions
        if (fromUnit === 'kg' && toUnit === 'lb') {
            return value * 2.20462;
        }
        if (fromUnit === 'lb' && toUnit === 'kg') {
            return value * 0.453592;
        }
        
        return null;
    }
}
