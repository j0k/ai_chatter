import * as vscode from 'vscode';
import { AIChatterPlugin, PluginCommand, PluginCommandResult, PluginManager as IPluginManager } from './PluginInterface';

// AI Chatter Plugin Manager - v1.2.0
export class PluginManager implements IPluginManager {
    private plugins: Map<string, AIChatterPlugin> = new Map();
    private commandRegistry: Map<string, { plugin: AIChatterPlugin; command: PluginCommand }> = new Map();
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('AI Chatter Plugins');
        this.log('Plugin Manager initialized');
    }

    // Register a new plugin
    async registerPlugin(plugin: AIChatterPlugin): Promise<boolean> {
        try {
            this.log(`Registering plugin: ${plugin.name} v${plugin.version}`);
            
            // Validate plugin
            if (!this.validatePlugin(plugin)) {
                this.log(`❌ Plugin validation failed: ${plugin.name}`);
                return false;
            }

            // Check for conflicts
            if (this.plugins.has(plugin.id)) {
                this.log(`❌ Plugin already registered: ${plugin.id}`);
                return false;
            }

            // Register plugin
            this.plugins.set(plugin.id, plugin);
            
            // Register commands
            for (const command of plugin.commands) {
                const commandKey = `/${command.name}`;
                this.commandRegistry.set(commandKey, { plugin, command });
                this.log(`✅ Registered command: ${commandKey}`);
            }

            // Activate plugin
            if (plugin.onActivate) {
                await plugin.onActivate();
                this.log(`✅ Plugin activated: ${plugin.name}`);
            }

            this.log(`✅ Plugin registered successfully: ${plugin.name}`);
            return true;

        } catch (error) {
            this.log(`❌ Error registering plugin ${plugin.name}: ${error}`);
            return false;
        }
    }

    // Unregister a plugin
    async unregisterPlugin(pluginId: string): Promise<boolean> {
        try {
            const plugin = this.plugins.get(pluginId);
            if (!plugin) {
                this.log(`❌ Plugin not found: ${pluginId}`);
                return false;
            }

            this.log(`Unregistering plugin: ${plugin.name}`);

            // Deactivate plugin
            if (plugin.onDeactivate) {
                await plugin.onDeactivate();
            }

            // Remove commands
            for (const command of plugin.commands) {
                const commandKey = `/${command.name}`;
                this.commandRegistry.delete(commandKey);
            }

            // Remove plugin
            this.plugins.delete(pluginId);
            
            this.log(`✅ Plugin unregistered: ${plugin.name}`);
            return true;

        } catch (error) {
            this.log(`❌ Error unregistering plugin ${pluginId}: ${error}`);
            return false;
        }
    }

    // Get a specific plugin
    getPlugin(pluginId: string): AIChatterPlugin | undefined {
        return this.plugins.get(pluginId);
    }

    // Get all registered plugins
    getAllPlugins(): AIChatterPlugin[] {
        return Array.from(this.plugins.values());
    }

    // Execute a plugin command
    async executePluginCommand(commandName: string, args: string[], username: string, chatId: string): Promise<PluginCommandResult> {
        try {
            const commandKey = `/${commandName}`;
            const registeredCommand = this.commandRegistry.get(commandKey);

            if (!registeredCommand) {
                return {
                    success: false,
                    message: `Command not found: ${commandName}`,
                    error: 'Command not registered by any plugin'
                };
            }

            const { plugin, command } = registeredCommand;

            this.log(`Executing plugin command: ${commandName} from plugin: ${plugin.name}`);

            // Check permissions
            if (command.requiresAuth) {
                // TODO: Implement auth check
                this.log(`⚠️ Auth required for command: ${commandName}`);
            }

            if (command.adminOnly) {
                // TODO: Implement admin check
                this.log(`⚠️ Admin required for command: ${commandName}`);
            }

            // Execute command
            const result = await command.handler(args, username, chatId);
            
            this.log(`✅ Plugin command executed: ${commandName}`);
            return result;

        } catch (error) {
            this.log(`❌ Error executing plugin command ${commandName}: ${error}`);
            return {
                success: false,
                message: `Command execution failed: ${commandName}`,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    // Reload all plugins
    async reloadPlugins(): Promise<void> {
        try {
            this.log('Reloading all plugins...');
            
            const pluginIds = Array.from(this.plugins.keys());
            
            // Unregister all plugins
            for (const pluginId of pluginIds) {
                await this.unregisterPlugin(pluginId);
            }

            // Re-register all plugins
            for (const plugin of this.getAllPlugins()) {
                await this.registerPlugin(plugin);
            }

            this.log('✅ All plugins reloaded successfully');
        } catch (error) {
            this.log(`❌ Error reloading plugins: ${error}`);
        }
    }

    // Get plugin status
    getPluginStatus(): string {
        const totalPlugins = this.plugins.size;
        const totalCommands = this.commandRegistry.size;
        
        return `📊 **Plugin Status**\n\n` +
               `**🔌 Active Plugins**: ${totalPlugins}\n` +
               `**📝 Total Commands**: ${totalCommands}\n` +
               `**🔄 Last Reload**: ${new Date().toLocaleString()}`;
    }

    // Get available plugin commands
    getAvailableCommands(): string {
        const commands = Array.from(this.commandRegistry.entries()).map(([command, { plugin }]) => {
            return `• \`${command}\` - ${plugin.name}`;
        });

        return `📝 **Available Plugin Commands**\n\n${commands.join('\n')}`;
    }

    // Validate plugin structure
    private validatePlugin(plugin: AIChatterPlugin): boolean {
        if (!plugin.id || !plugin.name || !plugin.version || !plugin.description || !plugin.author) {
            this.log(`❌ Plugin missing required fields: ${plugin.name}`);
            return false;
        }

        if (!plugin.commands || plugin.commands.length === 0) {
            this.log(`❌ Plugin has no commands: ${plugin.name}`);
            return false;
        }

        for (const command of plugin.commands) {
            if (!command.name || !command.description || !command.handler) {
                this.log(`❌ Plugin command missing required fields: ${plugin.name}`);
                return false;
            }
        }

        return true;
    }

    // Logging
    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] [PluginManager] ${message}`);
        console.log(`[PluginManager] ${message}`);
    }
}
