// AI Chatter Plugin Interface - v1.2.0
export interface AIChatterPlugin {
    // Plugin metadata
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    
    // Plugin lifecycle
    onActivate?(): Promise<void>;
    onDeactivate?(): Promise<void>;
    
    // Command registration
    commands: PluginCommand[];
    
    // Event handlers
    onMessageReceived?(username: string, message: string, chatId: string): Promise<boolean>;
    onAIResponse?(response: string, username: string): Promise<void>;
    onTerminalCommand?(command: string, result: string): Promise<void>;
    
    // Configuration
    getConfiguration?(): PluginConfiguration;
    validateConfiguration?(config: any): boolean;
}

// Plugin command definition
export interface PluginCommand {
    name: string;
    description: string;
    usage: string;
    examples: string[];
    handler: (args: string[], username: string, chatId: string) => Promise<PluginCommandResult>;
    requiresAuth?: boolean;
    adminOnly?: boolean;
}

// Plugin command result
export interface PluginCommandResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

// Plugin configuration
export interface PluginConfiguration {
    enabled: boolean;
    settings: Record<string, any>;
    permissions: string[];
}

// Plugin manager interface
export interface PluginManager {
    registerPlugin(plugin: AIChatterPlugin): Promise<boolean>;
    unregisterPlugin(pluginId: string): Promise<boolean>;
    getPlugin(pluginId: string): AIChatterPlugin | undefined;
    getAllPlugins(): AIChatterPlugin[];
    executePluginCommand(commandName: string, args: string[], username: string, chatId: string): Promise<PluginCommandResult>;
    reloadPlugins(): Promise<void>;
}
