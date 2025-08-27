import { 
  AIChatterPlugin, 
  PluginCommand, 
  PluginCommandResult, 
  PluginConfiguration,
  PluginManager 
} from '../PluginInterface';

describe('Plugin Interface', () => {
  describe('AIChatterPlugin', () => {
    it('should have required properties', () => {
      const plugin: AIChatterPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        commands: [],
        onActivate: jest.fn(),
        onDeactivate: jest.fn(),
      };

      expect(plugin.id).toBe('test-plugin');
      expect(plugin.name).toBe('Test Plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.description).toBe('A test plugin');
      expect(plugin.author).toBe('Test Author');
      expect(plugin.commands).toEqual([]);
      expect(typeof plugin.onActivate).toBe('function');
      expect(typeof plugin.onDeactivate).toBe('function');
    });

    it('should have optional event handlers', () => {
      const plugin: AIChatterPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        commands: [],
        onMessageReceived: jest.fn(),
        onAIResponse: jest.fn(),
        onTerminalCommand: jest.fn(),
      };

      expect(typeof plugin.onMessageReceived).toBe('function');
      expect(typeof plugin.onAIResponse).toBe('function');
      expect(typeof plugin.onTerminalCommand).toBe('function');
    });

    it('should have optional configuration methods', () => {
      const plugin: AIChatterPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        commands: [],
        getConfiguration: jest.fn(),
        validateConfiguration: jest.fn(),
      };

      expect(typeof plugin.getConfiguration).toBe('function');
      expect(typeof plugin.validateConfiguration).toBe('function');
    });
  });

  describe('PluginCommand', () => {
    it('should have required properties', () => {
      const command: PluginCommand = {
        name: 'test',
        description: 'Test command',
        usage: '/test',
        examples: ['/test'],
        handler: jest.fn(),
        requiresAuth: false,
        adminOnly: false,
      };

      expect(command.name).toBe('test');
      expect(command.description).toBe('Test command');
      expect(command.usage).toBe('/test');
      expect(command.examples).toEqual(['/test']);
      expect(typeof command.handler).toBe('function');
      expect(command.requiresAuth).toBe(false);
      expect(command.adminOnly).toBe(false);
    });

    it('should have optional permission flags', () => {
      const command: PluginCommand = {
        name: 'admin',
        description: 'Admin command',
        usage: '/admin',
        examples: ['/admin'],
        handler: jest.fn(),
        requiresAuth: true,
        adminOnly: true,
      };

      expect(command.requiresAuth).toBe(true);
      expect(command.adminOnly).toBe(true);
    });
  });

  describe('PluginCommandResult', () => {
    it('should have required properties', () => {
      const result: PluginCommandResult = {
        success: true,
        message: 'Success message',
        data: { key: 'value' },
        error: undefined,
      };

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success message');
      expect(result.data).toEqual({ key: 'value' });
      expect(result.error).toBeUndefined();
    });

    it('should handle error cases', () => {
      const result: PluginCommandResult = {
        success: false,
        message: 'Error message',
        error: 'Something went wrong',
      };

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error message');
      expect(result.error).toBe('Something went wrong');
    });
  });

  describe('PluginConfiguration', () => {
    it('should have required properties', () => {
      const config: PluginConfiguration = {
        enabled: true,
        settings: { timeout: 5000 },
        permissions: ['read', 'write'],
      };

      expect(config.enabled).toBe(true);
      expect(config.settings).toEqual({ timeout: 5000 });
      expect(config.permissions).toEqual(['read', 'write']);
    });
  });

  describe('PluginManager Interface', () => {
    it('should define required methods', () => {
      // This test ensures the interface is properly defined
      const manager: PluginManager = {
        registerPlugin: jest.fn(),
        unregisterPlugin: jest.fn(),
        getPlugin: jest.fn(),
        getAllPlugins: jest.fn(),
        executePluginCommand: jest.fn(),
        reloadPlugins: jest.fn(),
      };

      expect(typeof manager.registerPlugin).toBe('function');
      expect(typeof manager.unregisterPlugin).toBe('function');
      expect(typeof manager.getPlugin).toBe('function');
      expect(typeof manager.getAllPlugins).toBe('function');
      expect(typeof manager.executePluginCommand).toBe('function');
      expect(typeof manager.reloadPlugins).toBe('function');
    });
  });
});
