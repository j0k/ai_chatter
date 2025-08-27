import { PluginManager } from '../PluginManager';
import { AIChatterPlugin, PluginCommand, PluginCommandResult } from '../PluginInterface';
import { createMockPlugin, createMockCommand, createMockCommandResult } from '../../__tests__/setup';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with empty plugin and command registries', () => {
      expect(pluginManager.getAllPlugins()).toEqual([]);
      // Note: getAvailableCommands() is not accessible in tests due to private methods
    });
  });

  describe('registerPlugin', () => {
    it('should successfully register a valid plugin', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
      });

      const result = await pluginManager.registerPlugin(mockPlugin);

      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
      expect(pluginManager.getAllPlugins()).toHaveLength(1);
    });

    it('should call onActivate when registering plugin', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
        onActivate: jest.fn(),
      });

      await pluginManager.registerPlugin(mockPlugin);

      expect(mockPlugin.onActivate).toHaveBeenCalledTimes(1);
    });

    it('should register all plugin commands', async () => {
      const command1 = createMockCommand({ 
        name: 'cmd1',
        handler: jest.fn().mockResolvedValue(createMockCommandResult())
      });
      const command2 = createMockCommand({ 
        name: 'cmd2',
        handler: jest.fn().mockResolvedValue(createMockCommandResult())
      });
      const mockPlugin = createMockPlugin({
        commands: [command1, command2],
      });

      await pluginManager.registerPlugin(mockPlugin);

      // Test command execution
      const result1 = await pluginManager.executePluginCommand('cmd1', [], 'testuser', '123');
      const result2 = await pluginManager.executePluginCommand('cmd2', [], 'testuser', '123');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should reject plugin with missing required fields', async () => {
      const invalidPlugin = {
        id: '', // Missing required field
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        commands: [],
      } as AIChatterPlugin;

      const result = await pluginManager.registerPlugin(invalidPlugin);

      expect(result).toBe(false);
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
    });

    it('should reject plugin with no commands', async () => {
      const pluginWithoutCommands = createMockPlugin({
        commands: [],
      });

      const result = await pluginManager.registerPlugin(pluginWithoutCommands);

      expect(result).toBe(false);
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
    });

    it('should reject plugin with invalid commands', async () => {
      const invalidCommand = {
        name: '', // Missing required field
        description: 'Test command',
        usage: '/test',
        examples: ['/test'],
        handler: jest.fn(),
      } as PluginCommand;

      const pluginWithInvalidCommand = createMockPlugin({
        commands: [invalidCommand],
      });

      const result = await pluginManager.registerPlugin(pluginWithInvalidCommand);

      expect(result).toBe(false);
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
    });

    it('should reject duplicate plugin IDs', async () => {
      const plugin1 = createMockPlugin({
        commands: [createMockCommand()],
      });
      const plugin2 = createMockPlugin({
        id: 'test-plugin', // Same ID
        commands: [createMockCommand()],
      });

      await pluginManager.registerPlugin(plugin1);
      const result = await pluginManager.registerPlugin(plugin2);

      expect(result).toBe(false);
      expect(pluginManager.getAllPlugins()).toHaveLength(1);
    });

    it('should handle plugin activation errors gracefully', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
        onActivate: jest.fn().mockRejectedValue(new Error('Activation failed')),
      });

      const result = await pluginManager.registerPlugin(mockPlugin);

      expect(result).toBe(false);
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
    });
  });

  describe('unregisterPlugin', () => {
    it('should successfully unregister a plugin', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
        onDeactivate: jest.fn(),
      });

      await pluginManager.registerPlugin(mockPlugin);
      const result = await pluginManager.unregisterPlugin('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
      expect(mockPlugin.onDeactivate).toHaveBeenCalledTimes(1);
    });

    it('should handle non-existent plugin gracefully', async () => {
      const result = await pluginManager.unregisterPlugin('non-existent');

      expect(result).toBe(false);
    });

    it('should handle deactivation errors gracefully', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
        onDeactivate: jest.fn().mockRejectedValue(new Error('Deactivation failed')),
      });

      await pluginManager.registerPlugin(mockPlugin);
      const result = await pluginManager.unregisterPlugin('test-plugin');

      expect(result).toBe(false);
      // Plugin should still be removed even if deactivation fails
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });
  });

  describe('executePluginCommand', () => {
    it('should execute plugin command successfully', async () => {
      const mockHandler = jest.fn().mockResolvedValue(createMockCommandResult());
      const mockCommand = createMockCommand({
        name: 'test',
        handler: mockHandler,
      });

      const mockPlugin = createMockPlugin({
        commands: [mockCommand],
      });

      await pluginManager.registerPlugin(mockPlugin);

      const result = await pluginManager.executePluginCommand('test', ['arg1', 'arg2'], 'testuser', '123');

      expect(result.success).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(['arg1', 'arg2'], 'testuser', '123');
    });

    it('should return error for non-existent command', async () => {
      const result = await pluginManager.executePluginCommand('non-existent', [], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Command not found');
      expect(result.error).toBe('Command not registered by any plugin');
    });

    it('should handle command execution errors gracefully', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Command failed'));
      const mockCommand = createMockCommand({
        name: 'test',
        handler: mockHandler,
      });

      const mockPlugin = createMockPlugin({
        commands: [mockCommand],
      });

      await pluginManager.registerPlugin(mockPlugin);

      const result = await pluginManager.executePluginCommand('test', [], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Command execution failed');
      expect(result.error).toBe('Command failed');
    });

    it('should handle command handler returning undefined', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      const mockCommand = createMockCommand({
        name: 'test',
        handler: mockHandler,
      });

      const mockPlugin = createMockPlugin({
        commands: [mockCommand],
      });

      await pluginManager.registerPlugin(mockPlugin);

      const result = await pluginManager.executePluginCommand('test', [], 'testuser', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Command execution failed');
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by ID', async () => {
      const mockPlugin = createMockPlugin({
        commands: [createMockCommand()],
      });

      await pluginManager.registerPlugin(mockPlugin);
      const retrievedPlugin = pluginManager.getPlugin('test-plugin');

      expect(retrievedPlugin).toBe(mockPlugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const retrievedPlugin = pluginManager.getPlugin('non-existent');

      expect(retrievedPlugin).toBeUndefined();
    });
  });

  describe('getAllPlugins', () => {
    it('should return all registered plugins', async () => {
      const plugin1 = createMockPlugin({
        id: 'plugin1',
        commands: [createMockCommand()],
      });
      const plugin2 = createMockPlugin({
        id: 'plugin2',
        commands: [createMockCommand()],
      });

      await pluginManager.registerPlugin(plugin1);
      await pluginManager.registerPlugin(plugin2);

      const allPlugins = pluginManager.getAllPlugins();

      expect(allPlugins).toHaveLength(2);
      expect(allPlugins).toContain(plugin1);
      expect(allPlugins).toContain(plugin2);
    });

    it('should return empty array when no plugins registered', () => {
      const allPlugins = pluginManager.getAllPlugins();

      expect(allPlugins).toEqual([]);
    });
  });

  describe('reloadPlugins', () => {
    it('should reload all plugins successfully', async () => {
      const plugin1 = createMockPlugin({
        id: 'plugin1',
        commands: [createMockCommand()],
        onActivate: jest.fn(),
        onDeactivate: jest.fn(),
      });
      const plugin2 = createMockPlugin({
        id: 'plugin2',
        commands: [createMockCommand()],
        onActivate: jest.fn(),
        onDeactivate: jest.fn(),
      });

      await pluginManager.registerPlugin(plugin1);
      await pluginManager.registerPlugin(plugin2);

      await pluginManager.reloadPlugins();

      // Verify plugins were deactivated and reactivated
      expect(plugin1.onDeactivate).toHaveBeenCalledTimes(1);
      expect(plugin1.onActivate).toHaveBeenCalledTimes(2); // Once during initial registration, once during reload
      expect(plugin2.onDeactivate).toHaveBeenCalledTimes(1);
      expect(plugin2.onActivate).toHaveBeenCalledTimes(2);
    });

    it('should handle reload errors gracefully', async () => {
      const plugin = createMockPlugin({
        commands: [createMockCommand()],
        onActivate: jest.fn().mockRejectedValue(new Error('Activation failed')),
      });

      await pluginManager.registerPlugin(plugin);

      // Should not throw error
      await expect(pluginManager.reloadPlugins()).resolves.not.toThrow();
    });
  });

  describe('Plugin Status and Commands', () => {
    it('should provide plugin status information', async () => {
      const plugin1 = createMockPlugin({
        id: 'plugin1',
        commands: [createMockCommand({ name: 'cmd1' })],
      });
      const plugin2 = createMockPlugin({
        id: 'plugin2',
        commands: [createMockCommand({ name: 'cmd2' }), createMockCommand({ name: 'cmd3' })],
      });

      await pluginManager.registerPlugin(plugin1);
      await pluginManager.registerPlugin(plugin2);

      const status = pluginManager.getPluginStatus();

      expect(status).toContain('Active Plugins: 2');
      expect(status).toContain('Total Commands: 3');
      expect(status).toContain('Plugin Status');
    });

    it('should provide available plugin commands', async () => {
      const plugin = createMockPlugin({
        name: 'Test Plugin',
        commands: [createMockCommand({ name: 'test' })],
      });

      await pluginManager.registerPlugin(plugin);

      const commands = pluginManager.getAvailableCommands();

      expect(commands).toContain('Available Plugin Commands');
      expect(commands).toContain('/test - Test Plugin');
    });
  });
});
