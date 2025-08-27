import { CalculatorPlugin } from '../CalculatorPlugin';

describe('CalculatorPlugin', () => {
  let calculatorPlugin: CalculatorPlugin;

  beforeEach(() => {
    calculatorPlugin = new CalculatorPlugin();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Plugin Structure', () => {
    it('should have correct plugin metadata', () => {
      expect(calculatorPlugin.id).toBe('calculator');
      expect(calculatorPlugin.name).toBe('Calculator Plugin');
      expect(calculatorPlugin.version).toBe('1.0.0');
      expect(calculatorPlugin.description).toBe('Perform mathematical calculations and conversions');
      expect(calculatorPlugin.author).toBe('AI Chatter Team');
    });

    it('should have two commands', () => {
      expect(calculatorPlugin.commands).toHaveLength(2);
    });

    it('should have calc command', () => {
      const calcCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'calc');
      expect(calcCommand).toBeDefined();
      expect(calcCommand?.description).toBe('Perform mathematical calculations');
      expect(calcCommand?.usage).toBe('/calc <expression>');
      expect(calcCommand?.examples).toEqual([
        '/calc 2 + 2',
        '/calc 10 * 5',
        '/calc sqrt(16)',
        '/calc 2^8'
      ]);
    });

    it('should have convert command', () => {
      const convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');
      expect(convertCommand).toBeDefined();
      expect(convertCommand?.description).toBe('Convert between units');
      expect(convertCommand?.usage).toBe('/convert <value> <from_unit> to <to_unit>');
      expect(convertCommand?.examples).toEqual([
        '/convert 100 USD to EUR',
        '/convert 32 F to C',
        '/convert 1 mile to km'
      ]);
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should activate successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await calculatorPlugin.onActivate?.();
      
      expect(consoleSpy).toHaveBeenCalledWith('[CalculatorPlugin] Plugin activated');
      consoleSpy.mockRestore();
    });

    it('should deactivate successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await calculatorPlugin.onDeactivate?.();
      
      expect(consoleSpy).toHaveBeenCalledWith('[CalculatorPlugin] Plugin deactivated');
      consoleSpy.mockRestore();
    });
  });

  describe('Calc Command', () => {
    let calcCommand: any;

    beforeEach(() => {
      calcCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'calc');
    });

    describe('Basic Operations', () => {
      it('should handle addition', async () => {
        const result = await calcCommand.handler(['2', '+', '3'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Expression**: `2 + 3`');
        expect(result.message).toContain('**Result**: `5`');
        expect(result.data.expression).toBe('2 + 3');
        expect(result.data.result).toBe(5);
      });

      it('should handle subtraction', async () => {
        const result = await calcCommand.handler(['10', '-', '4'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Result**: `6`');
        expect(result.data.result).toBe(6);
      });

      it('should handle multiplication', async () => {
        const result = await calcCommand.handler(['6', '*', '7'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Result**: `42`');
        expect(result.data.result).toBe(42);
      });

      it('should handle division', async () => {
        const result = await calcCommand.handler(['15', '/', '3'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Result**: `5`');
        expect(result.data.result).toBe(5);
      });

      it('should handle exponentiation', async () => {
        const result = await calcCommand.handler(['2', '^', '8'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Result**: `256`');
        expect(result.data.result).toBe(256);
      });
    });

    describe('Mathematical Functions', () => {
      it('should handle square root', async () => {
        const result = await calcCommand.handler(['sqrt(16)'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**Result**: `4`');
        expect(result.data.result).toBe(4);
      });

      it('should handle sine function', async () => {
        const result = await calcCommand.handler(['sin(90)'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBeCloseTo(1, 5); // sin(90°) = 1
      });

      it('should handle cosine function', async () => {
        const result = await calcCommand.handler(['cos(0)'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBeCloseTo(1, 5); // cos(0°) = 1
      });

      it('should handle complex expressions', async () => {
        const result = await calcCommand.handler(['sqrt(16)', '+', '2', '*', '3'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBe(10); // sqrt(16) + 2*3 = 4 + 6 = 10
      });
    });

    describe('Error Handling', () => {
      it('should handle no arguments', async () => {
        const result = await calcCommand.handler([], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Expression is required');
        expect(result.error).toBe('Usage: /calc <expression>');
      });

      it('should handle invalid expressions', async () => {
        const result = await calcCommand.handler(['invalid'], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid expression: invalid');
        expect(result.error).toBe('Expression could not be evaluated');
      });

      it('should handle division by zero gracefully', async () => {
        const result = await calcCommand.handler(['10', '/', '0'], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid expression: 10 / 0');
      });
    });

    describe('Edge Cases', () => {
      it('should handle single numbers', async () => {
        const result = await calcCommand.handler(['42'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBe(42);
      });

      it('should handle negative numbers', async () => {
        const result = await calcCommand.handler(['-5'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBe(-5);
      });

      it('should handle decimal numbers', async () => {
        const result = await calcCommand.handler(['3.14'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.result).toBe(3.14);
      });
    });
  });

  describe('Convert Command', () => {
    let convertCommand: any;

    beforeEach(() => {
      convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');
    });

    describe('Temperature Conversions', () => {
      it('should convert Celsius to Fahrenheit', async () => {
        const result = await convertCommand.handler(['0', 'C', 'to', 'F'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**0 c** = **32.0000 f**');
        expect(result.data.from.value).toBe(0);
        expect(result.data.from.unit).toBe('C');
        expect(result.data.to.value).toBe(32);
        expect(result.data.to.unit).toBe('F');
      });

      it('should convert Fahrenheit to Celsius', async () => {
        const result = await convertCommand.handler(['32', 'F', 'to', 'C'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**32 f** = **0.0000 c**');
        expect(result.data.to.value).toBeCloseTo(0, 1);
      });

      it('should convert Celsius to Kelvin', async () => {
        const result = await convertCommand.handler(['0', 'C', 'to', 'K'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**0 c** = **273.1500 k**');
        expect(result.data.to.value).toBe(273.15);
      });

      it('should convert Kelvin to Celsius', async () => {
        const result = await convertCommand.handler(['273.15', 'K', 'to', 'C'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**273.15 k** = **0.0000 c**');
        expect(result.data.to.value).toBeCloseTo(0, 2);
      });
    });

    describe('Distance Conversions', () => {
      it('should convert kilometers to miles', async () => {
        const result = await convertCommand.handler(['10', 'km', 'to', 'mile'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**10 km** = **6.2137 mile**');
        expect(result.data.to.value).toBeCloseTo(6.2137, 4);
      });

      it('should convert miles to kilometers', async () => {
        const result = await convertCommand.handler(['5', 'mile', 'to', 'km'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**5 mile** = **8.0467 km**');
        expect(result.data.to.value).toBeCloseTo(8.0467, 4);
      });

      it('should convert meters to feet', async () => {
        const result = await convertCommand.handler(['1', 'm', 'to', 'ft'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**1 m** = **3.2808 ft**');
        expect(result.data.to.value).toBeCloseTo(3.2808, 4);
      });

      it('should convert feet to meters', async () => {
        const result = await convertCommand.handler(['3.2808', 'ft', 'to', 'm'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**3.2808 ft** = **1.0000 m**');
        expect(result.data.to.value).toBeCloseTo(1, 4);
      });
    });

    describe('Currency Conversions', () => {
      it('should convert USD to EUR', async () => {
        const result = await convertCommand.handler(['100', 'USD', 'to', 'EUR'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**100 usd** = **85.0000 eur**');
        expect(result.data.to.value).toBe(85);
      });

      it('should convert EUR to USD', async () => {
        const result = await convertCommand.handler(['85', 'EUR', 'to', 'USD'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**85 eur** = **100.3000 usd**');
        expect(result.data.to.value).toBe(100.3);
      });
    });

    describe('Weight Conversions', () => {
      it('should convert kilograms to pounds', async () => {
        const result = await convertCommand.handler(['1', 'kg', 'to', 'lb'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**1 kg** = **2.2046 lb**');
        expect(result.data.to.value).toBeCloseTo(2.2046, 4);
      });

      it('should convert pounds to kilograms', async () => {
        const result = await convertCommand.handler(['2.2046', 'lb', 'to', 'kg'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**2.2046 lb** = **1.0000 kg**');
        expect(result.data.to.value).toBeCloseTo(1, 4);
      });
    });

    describe('Error Handling', () => {
      it('should handle insufficient arguments', async () => {
        const result = await convertCommand.handler(['100'], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid conversion format');
        expect(result.error).toBe('Usage: /convert <value> <from_unit> to <to_unit>');
      });

      it('should handle invalid value', async () => {
        const result = await convertCommand.handler(['invalid', 'USD', 'to', 'EUR'], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid value');
        expect(result.error).toBe('Value must be a number');
      });

      it('should handle unsupported conversion', async () => {
        const result = await convertCommand.handler(['100', 'USD', 'to', 'INVALID'], 'testuser', '123');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Conversion not supported: usd to invalid');
        expect(result.error).toBe('Unsupported unit conversion');
      });

      it('should handle case-insensitive units', async () => {
        const result = await convertCommand.handler(['100', 'usd', 'to', 'eur'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.message).toContain('**100 usd** = **85.0000 eur**');
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero values', async () => {
        const result = await convertCommand.handler(['0', 'C', 'to', 'F'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.to.value).toBe(32);
      });

      it('should handle negative values', async () => {
        const result = await convertCommand.handler(['-10', 'C', 'to', 'F'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.to.value).toBe(14); // -10°C = 14°F
      });

      it('should handle large values', async () => {
        const result = await convertCommand.handler(['1000', 'km', 'to', 'mile'], 'testuser', '123');

        expect(result.success).toBe(true);
        expect(result.data.to.value).toBeCloseTo(621.371, 3);
      });
    });
  });

  describe('Command Permissions', () => {
    it('should not require authentication', () => {
      const calcCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'calc');
      const convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');

      expect(calcCommand?.requiresAuth).toBe(false);
      expect(convertCommand?.requiresAuth).toBe(false);
    });

    it('should not require admin privileges', () => {
      const calcCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'calc');
      const convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');

      expect(calcCommand?.adminOnly).toBe(false);
      expect(convertCommand?.adminOnly).toBe(false);
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should provide accurate temperature conversions', async () => {
      const convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');
      
      // Test round-trip conversion
      const result1 = await convertCommand!.handler(['25', 'C', 'to', 'F'], 'testuser', '123');
      const result2 = await convertCommand!.handler(['77', 'F', 'to', 'C'], 'testuser', '123');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data.to.value).toBe(77); // 25°C = 77°F
      expect(result2.data.to.value).toBeCloseTo(25, 1); // 77°F = 25°C
    });

    it('should provide accurate distance conversions', async () => {
      const convertCommand = calculatorPlugin.commands.find(cmd => cmd.name === 'convert');
      
      // Test round-trip conversion
      const result1 = await convertCommand!.handler(['100', 'km', 'to', 'mile'], 'testuser', '123');
      const result2 = await convertCommand!.handler(['62.1371', 'mile', 'to', 'km'], 'testuser', '123');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data.to.value).toBeCloseTo(62.1371, 4);
      expect(result2.data.to.value).toBeCloseTo(100, 4);
    });
  });
});
