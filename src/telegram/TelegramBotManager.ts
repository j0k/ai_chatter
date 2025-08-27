import TelegramBot from 'node-telegram-bot-api';
import * as vscode from 'vscode';
import { ConfigurationManager } from '../utils/ConfigurationManager';
import { TerminalCommandHandler, TerminalCommandResult } from '../utils/TerminalCommandHandler';
import { ContextSizeHandler, ContextSizeInfo } from '../utils/ContextSizeHandler';

export interface ChatSession {
    chatId: string;
    isAIChatterEnabled: boolean;
    lastMessageTime: number;
    telegramChatId?: number; // Store Telegram chat ID for responses
    telegramUsername?: string; // Store username for responses
}

export class TelegramBotManager {
    private bot: TelegramBot | null = null;
    private isRunning: boolean = false;
    private configurationManager: ConfigurationManager;
    private terminalCommandHandler: TerminalCommandHandler;
    private contextSizeHandler: ContextSizeHandler;
    private activeChatSessions: Map<string, ChatSession> = new Map();
    private onMessageReceived: ((username: string, message: string) => void) | null = null;
    private messageHistory: Array<{username: string; message: string; timestamp: number; type: 'telegram' | 'ai_response'}> = [];
    private readonly maxHistorySize = 10;

    constructor(configurationManager: ConfigurationManager) {
        this.configurationManager = configurationManager;
        this.terminalCommandHandler = new TerminalCommandHandler();
        this.contextSizeHandler = new ContextSizeHandler();
    }

    // Register callback for when messages are received
    onTelegramMessage(callback: (username: string, message: string) => void): void {
        this.onMessageReceived = callback;
    }

    // Enable AI-Chatter for a specific chat
    enableAIChatterForChat(chatId: string, telegramChatId?: number, telegramUsername?: string): void {
        this.activeChatSessions.set(chatId, {
            chatId,
            isAIChatterEnabled: true,
            lastMessageTime: Date.now(),
            telegramChatId,
            telegramUsername
        });
        console.log(`AI-Chatter enabled for chat: ${chatId} with Telegram chat ID: ${telegramChatId}`);
    }

    // Disable AI-Chatter for a specific chat
    disableAIChatterForChat(chatId: string): void {
        this.activeChatSessions.delete(chatId);
        console.log(`AI-Chatter disabled for chat: ${chatId}`);
    }

    // Check if AI-Chatter is enabled for a specific chat
    isAIChatterEnabledForChat(chatId: string): boolean {
        return this.activeChatSessions.has(chatId);
    }

    // Get all active chat sessions
    getActiveChatSessions(): ChatSession[] {
        return Array.from(this.activeChatSessions.values());
    }

    // Send AI response back to Telegram
    async sendAIResponseToTelegram(response: string, chatId?: string): Promise<boolean> {
        try {
            // Find the active session for this chat
            let targetSession: ChatSession | undefined;
            
            if (chatId) {
                targetSession = this.activeChatSessions.get(chatId);
            } else {
                // Find any active session with Telegram info
                targetSession = Array.from(this.activeChatSessions.values())
                    .find(session => session.isAIChatterEnabled && session.telegramChatId);
            }

            if (!targetSession || !targetSession.telegramChatId) {
                console.log('No active Telegram chat session found for response');
                return false;
            }

            if (!this.bot) {
                console.log('Bot not running, cannot send response');
                return false;
            }

            // Format the response for Telegram
            const formattedResponse = this.formatResponseForTelegram(response, targetSession.telegramUsername);
            
            // Send to Telegram
            await this.bot.sendMessage(targetSession.telegramChatId, formattedResponse, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            // Add AI response to history
            if (targetSession.telegramUsername) {
                this.addAIResponseToHistory(targetSession.telegramUsername, response);
            }

            console.log(`AI response sent to Telegram chat ${targetSession.telegramChatId}`);
            this.logToOutput(`[Chat → Telegram] AI Response sent to @${targetSession.telegramUsername}`);
            
            return true;
        } catch (error) {
            console.error('Failed to send AI response to Telegram:', error);
            this.logToOutput(`[ERROR] Failed to send AI response to Telegram: ${error}`);
            return false;
        }
    }

    // Handle terminal commands from Telegram
    private async handleTerminalCommand(msg: TelegramBot.Message, username: string, messageText: string, telegramChatId: number): Promise<void> {
        try {
            // Extract the command (remove '/terminal ' prefix)
            const command = messageText.substring(10).trim();
            
            if (!command) {
                await this.sendTerminalResponse(telegramChatId, '❌ Please provide a command after /terminal');
                return;
            }

            // Send "executing" message
            await this.sendTerminalResponse(telegramChatId, `🔄 Executing: \`${command}\`\n⏳ Please wait...`);

            // Execute the command
            const result = await this.terminalCommandHandler.executeCommand(command, username);
            
            // Format and send the result
            const formattedResult = this.formatTerminalResult(result);
            await this.sendTerminalResponse(telegramChatId, formattedResult);

        } catch (error) {
            console.error('Error handling terminal command:', error);
            await this.sendTerminalResponse(telegramChatId, `❌ Error executing command: ${error}`);
        }
    }

    // Send terminal command response to Telegram
    private async sendTerminalResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send terminal response to Telegram:', error);
        }
    }

    // Format terminal command result for Telegram
    private formatTerminalResult(result: TerminalCommandResult): string {
        let formatted = `🖥️ **Terminal Command Result**\n\n`;
        formatted += `**Command:** \`${result.command}\`\n`;
        formatted += `**Status:** ${result.success ? '✅ Success' : '❌ Failed'}\n`;
        formatted += `**Exit Code:** ${result.exitCode}\n`;
        formatted += `**Execution Time:** ${result.executionTime}ms\n\n`;

        if (result.output) {
            formatted += `**Output:**\n\`\`\`\n${result.output}\n\`\`\`\n\n`;
        }

        if (result.error) {
            formatted += `**Error:**\n\`\`\`\n${result.error}\n\`\`\`\n\n`;
        }

        // Truncate if too long (Telegram has 4096 character limit)
        if (formatted.length > 4000) {
            formatted = formatted.substring(0, 4000) + '\n\n... (response truncated due to length)';
        }

        return formatted;
    }

    // Get terminal command handler
    getTerminalCommandHandler(): TerminalCommandHandler {
        return this.terminalCommandHandler;
    }

    // Handle context size command from Telegram
    private async handleContextSizeCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            // Force refresh context size detection
            this.contextSizeHandler.refreshContextSize();
            
            // Get current context size
            const contextSize = this.contextSizeHandler.getCurrentContextSize();
            
            if (contextSize && contextSize.isAvailable) {
                // Format and send context size information
                const formattedResult = this.formatContextSizeResult(contextSize);
                await this.sendContextSizeResponse(telegramChatId, formattedResult);
            } else {
                // No context size available
                await this.sendContextSizeResponse(telegramChatId, 
                    '❌ Context size not available\n\n' +
                    'Make sure you have a Cursor AI chat tab open with context size information visible.'
                );
            }

        } catch (error) {
            console.error('Error handling context size command:', error);
            await this.sendContextSizeResponse(telegramChatId, `❌ Error getting context size: ${error}`);
        }
    }

    // Send context size response to Telegram
    private async sendContextSizeResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send context size response to Telegram:', error);
        }
    }

    // Format context size result for Telegram
    private formatContextSizeResult(contextSize: ContextSizeInfo): string {
        let formatted = `📊 **Context Size Information**\n\n`;
        formatted += `**Current Usage:** ${contextSize.percentage}%\n`;
        formatted += `**Source:** ${contextSize.source}\n`;
        formatted += `**Detected:** ${new Date(contextSize.timestamp).toLocaleString()}\n\n`;

        // Add visual indicator
        if (contextSize.percentage >= 80) {
            formatted += `⚠️ **High Usage Warning**\n`;
            formatted += `Your context is ${contextSize.percentage}% full. Consider clearing some context or starting a new chat.\n\n`;
        } else if (contextSize.percentage >= 60) {
            formatted += `🟡 **Moderate Usage**\n`;
            formatted += `Your context is ${contextSize.percentage}% full. You still have room for more conversation.\n\n`;
        } else {
            formatted += `🟢 **Low Usage**\n`;
            formatted += `Your context is only ${contextSize.percentage}% full. Plenty of room for more conversation!\n\n`;
        }

        // Add usage bar visualization
        const barLength = 20;
        const filledLength = Math.round((contextSize.percentage / 100) * barLength);
        const emptyLength = barLength - filledLength;
        
        const filledBar = '█'.repeat(filledLength);
        const emptyBar = '░'.repeat(emptyLength);
        
        formatted += `**Usage Bar:**\n`;
        formatted += `\`${filledBar}${emptyBar}\` ${contextSize.percentage}%\n\n`;

        // Add helpful tips
        formatted += `**💡 Tips:**\n`;
        if (contextSize.percentage >= 80) {
            formatted += `• Start a new chat to reset context\n`;
            formatted += `• Remove unnecessary files from context\n`;
            formatted += `• Clear chat history if possible\n`;
        } else if (contextSize.percentage >= 60) {
            formatted += `• You can continue the conversation\n`;
            formatted += `• Monitor usage as you chat\n`;
        } else {
            formatted += `• You have plenty of context space\n`;
            formatted += `• Feel free to add more files or continue chatting\n`;
        }

        return formatted;
    }

    // Handle help command from Telegram
    private async handleHelpCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const helpMessage = this.formatHelpMessage();
            await this.sendHelpResponse(telegramChatId, helpMessage);
        } catch (error) {
            console.error('Error handling help command:', error);
            await this.sendHelpResponse(telegramChatId, `❌ Error getting help: ${error}`);
        }
    }

    // Handle usage command from Telegram
    private async handleUsageCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const usageMessage = this.formatUsageMessage();
            await this.sendUsageResponse(telegramChatId, usageMessage);
        } catch (error) {
            console.error('Error handling usage command:', error);
            await this.sendUsageResponse(telegramChatId, `❌ Error getting usage: ${error}`);
        }
    }

    // Send help response to Telegram
    private async sendHelpResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send help response to Telegram:', error);
        }
    }

    // Send usage response to Telegram
    private async sendUsageResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send usage response to Telegram:', error);
        }
    }

    // Format help message for Telegram
    private formatHelpMessage(): string {
        let help = `🤖 **AI-Chatter Help & Commands**\n\n`;
        help += `Welcome to AI-Chatter! Here are all available commands:\n\n`;
        
        help += `**📱 Basic Commands**\n`;
        help += `• \`/help\` - Show this help message\n`;
        help += `• \`/usage\` - Show detailed usage examples\n`;
        help += `• \`/version\` - Show current version and build information\n`;
        help += `• \`/context_size\` - Check Cursor AI context usage\n`;
        help += `• \`/terminal <command>\` - Execute terminal commands\n`;
        help += `• \`/history\` - View last 10 messages\n`;
        help += `• \`/tabs\` - List all open tabs and message tabs\n`;
        help += `• \`/msg <message>\` - Send message directly to Cursor AI\n`;
        help += `• \`/msgactive <message>\` - Send message to currently active element\n\n`;
        
        help += `**🔧 Setup Commands**\n`;
        help += `• \`/status\` - Check bot and connection status\n`;
        help += `• \`/config\` - Show current configuration\n`;
        help += `• \`/users\` - List authorized users\n\n`;

        help += `**🎯 Advanced Commands**\n`;
        help += `• \`/cheat <search> <add>\` - Find text and add content after it\n\n`;
        
        help += `**💬 Chat Integration**\n`;
        help += `• Enable AI-Chatter in Cursor AI chat tabs\n`;
        help += `• Send messages from Telegram to Cursor AI\n`;
        help += `• Receive AI responses back to Telegram\n`;
        help += `• Monitor context usage remotely\n\n`;
        
        help += `**🖥️ Terminal Features**\n`;
        help += `• Execute safe shell commands remotely\n`;
        help += `• Get real-time command results\n`;
        help += `• Built-in security and validation\n`;
        help += `• Execution logging and monitoring\n\n`;
        
        help += `**📊 Context Monitoring**\n`;
        help += `• Real-time context size detection\n`;
        help += `• Usage warnings and recommendations\n`;
        help += `• Visual usage indicators\n`;
        help += `• Smart optimization tips\n\n`;
        
        help += `**🌐 More Information**\n`;
        help += `• **GitHub Repository**: [https://github.com/j0k/ai_chatter](https://github.com/j0k/ai_chatter)\n`;
        help += `• **Documentation**: Check README.md for detailed guides\n`;
        help += `• **Version**: Currently running v0.2.9\n`;
        help += `• **Support**: Open issues on GitHub\n\n`;
        
        help += `**💡 Quick Start**\n`;
        help += `1. Enable AI-Chatter in Cursor AI\n`;
        help += `2. Send \`/context_size\` to check status\n`;
        help += `3. Use \`/terminal ls\` to test terminal\n`;
        help += `4. Send regular messages to chat with Cursor AI\n\n`;
        
        help += `Need more details? Use \`/usage\` for examples! 🚀`;
        
        return help;
    }

    // Format usage message for Telegram
    private formatUsageMessage(): string {
        let usage = `📚 **AI-Chatter Usage Examples**\n\n`;
        usage += `Here are practical examples of how to use AI-Chatter:\n\n`;
        
        usage += `**🔍 Context Monitoring**\n`;
        usage += `\`/context_size\`\n`;
        usage += `→ Check your Cursor AI context usage\n`;
        usage += `→ Get warnings if usage is high\n`;
        usage += `→ Receive optimization tips\n\n`;
        
        usage += `**📑 Tab Management**\n`;
        usage += `\`/tabs\`\n`;
        usage += `→ List all open tabs in AI Cursor\n`;
        usage += `→ Identify message tabs for AI Chatter\n`;
        usage += `→ Monitor active tab status\n\n`;
        
        usage += `**💬 Direct Messaging**\n`;
        usage += `\`/msg Hello, how are you?\`\n`;
        usage += `→ Send message directly to Cursor AI\n`;
        usage += `→ Message appears in active chat tab\n`;
        usage += `→ Perfect for quick interactions\n\n`;
        
        usage += `\`/msg Can you help me with this code?\`\n`;
        usage += `→ Send coding questions directly\n`;
        usage += `→ Get immediate AI assistance\n`;
        usage += `→ No need to copy/paste\n\n`;

        usage += `**🎯 Active Element Messaging**\n`;
        usage += `\`/msgactive Hello, how are you?\`\n`;
        usage += `→ Send message to currently focused element\n`;
        usage += `→ Targets the active input field\n`;
        usage += `→ Perfect for form filling and focused interactions\n\n`;
        
        usage += `\`/msgactive Can you help me with this code?\`\n`;
        usage += `→ Send messages to specific input areas\n`;
        usage += `→ Works with any focused element\n`;
        usage += `→ Ideal for targeted messaging\n\n`;
        
        usage += `**🖥️ Terminal Commands**\n`;
        usage += `\`/terminal ls -la\`\n`;
        usage += `→ List files in current directory\n`;
        usage += `→ Get detailed file information\n`;
        usage += `→ Safe command execution\n\n`;
        
        usage += `\`/terminal pwd\`\n`;
        usage += `→ Show current working directory\n`;
        usage += `→ Useful for navigation\n`;
        usage += `→ Quick path checking\n\n`;
        
        usage += `\`/terminal git status\`\n`;
        usage += `→ Check Git repository status\n`;
        usage += `→ Monitor code changes\n`;
        usage += `→ Track development progress\n\n`;
        
        usage += `\`/terminal npm install\`\n`;
        usage += `→ Install Node.js dependencies\n`;
        usage += `→ Manage project packages\n`;
        usage += `→ Update project libraries\n\n`;

        usage += `**🎯 Advanced Commands**\n`;
        usage += `\`/cheat WWWDDD hello\`\n`;
        usage += `→ Find "WWWDDD" in all documents\n`;
        usage += `→ Add "hello" after each occurrence\n`;
        usage += `→ Perfect for bulk text modifications\n\n`;
        
        usage += `\`/cheat button Click me\`\n`;
        usage += `→ Find "button" text in documents\n`;
        usage += `→ Add "Click me" after each button\n`;
        usage += `→ Great for UI text updates\n\n`;

        usage += `**📱 System Commands**\n`;
        usage += `\`/version\`\n`;
        usage += `→ Show current version information\n`;
        usage += `→ Display build date and features\n`;
        usage += `→ Check for updates and changes\n\n`;
        
        usage += `**💬 Chat Integration**\n`;
        usage += `Send any message (without commands):\n`;
        usage += `→ Message appears in Cursor AI chat\n`;
        usage += `→ AI processes your request\n`;
        usage += `→ Response sent back to Telegram\n`;
        usage += `→ Full conversation loop\n\n`;
        
        usage += `**📱 Command Examples**\n`;
        usage += `• \`Hello, can you help me with this code?\`\n`;
        usage += `• \`Please review this function\`\n`;
        usage += `• \`Explain how this algorithm works\`\n`;
        usage += `• \`Debug this error message\`\n`;
        usage += `• \`Optimize this code for performance\`\n\n`;
        
        usage += `**⚡ Workflow Examples**\n\n`;
        usage += `**Scenario 1: Code Review**\n`;
        usage += `1. \`/context_size\` - Check available space\n`;
        usage += `2. Send code snippet to Telegram\n`;
        usage += `3. AI analyzes and responds\n`;
        usage += `4. Get feedback and suggestions\n\n`;
        
        usage += `**Scenario 2: Remote Development**\n`;
        usage += `1. \`/terminal git pull\` - Update code\n`;
        usage += `2. \`/terminal npm run build\` - Build project\n`;
        usage += `3. Send build output to AI for analysis\n`;
        usage += `4. Get debugging help remotely\n\n`;
        
        usage += `**Scenario 3: Context Management**\n`;
        usage += `1. \`/context_size\` - Monitor usage\n`;
        usage += `2. Get warnings if usage is high\n`;
        usage += `3. Follow optimization tips\n`;
        usage += `4. Maintain efficient context\n\n`;
        
        usage += `**🔒 Security Features**\n`;
        usage += `• Command validation and blocking\n`;
        usage += `• Safe command execution\n`;
        usage += `• Timeout protection\n`;
        usage += `• Execution logging\n`;
        usage += `• User authorization\n\n`;
        
        usage += `**💡 Pro Tips**\n`;
        usage += `• Use \`/context_size\` regularly to monitor usage\n`;
        usage += `• Combine terminal commands with AI chat\n`;
        usage += `• Enable AI-Chatter only when needed\n`;
        usage += `• Check \`/help\` for command reference\n`;
        usage += `• Monitor terminal command outputs\n\n`;
        
        usage += `**🚀 Ready to Code from Anywhere?**\n`;
        usage += `Start with \`/context_size\` to check your setup!\n`;
        usage += `Then try \`/terminal pwd\` to test terminal access!\n`;
        usage += `Finally, send a message to start chatting with Cursor AI!\n\n`;
        
        usage += `Need help? Use \`/help\` for command reference! 📖`;
        
        return usage;
    }

    // Handle status command from Telegram
    private async handleStatusCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const statusMessage = this.formatStatusMessage();
            await this.sendStatusResponse(telegramChatId, statusMessage);
        } catch (error) {
            console.error('Error handling status command:', error);
            await this.sendStatusResponse(telegramChatId, `❌ Error getting status: ${error}`);
        }
    }

    // Handle config command from Telegram
    private async handleConfigCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const configMessage = this.formatConfigMessage();
            await this.sendConfigResponse(telegramChatId, configMessage);
        } catch (error) {
            console.error('Error handling config command:', error);
            await this.sendConfigResponse(telegramChatId, `❌ Error getting configuration: ${error}`);
        }
    }

    // Handle users command from Telegram
    private async handleUsersCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const usersMessage = this.formatUsersMessage();
            await this.sendUsersResponse(telegramChatId, usersMessage);
        } catch (error) {
            console.error('Error handling users command:', error);
            await this.sendUsersResponse(telegramChatId, `❌ Error getting users: ${error}`);
        }
    }

    // Send status response to Telegram
    private async sendStatusResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send status response to Telegram:', error);
        }
    }

    // Send config response to Telegram
    private async sendConfigResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send config response to Telegram:', error);
        }
    }

    // Send users response to Telegram
    private async sendUsersResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send users response to Telegram:', error);
        }
    }

    // Format status message for Telegram
    private formatStatusMessage(): string {
        let status = `🔍 **AI-Chatter Status Report**\n\n`;
        
        // Bot status
        status += `**🤖 Bot Status**\n`;
        status += `• **Running**: ${this.isRunning ? '✅ Yes' : '❌ No'}\n`;
        status += `• **Connected**: ${this.bot ? '✅ Yes' : '❌ No'}\n`;
        status += `• **Version**: v0.2.6\n`;
        status += `• **Last Update**: ${new Date().toLocaleString()}\n\n`;
        
        // Connection status
        status += `**🔗 Connection Status**\n`;
        if (this.bot) {
            status += `• **Telegram API**: ✅ Connected\n`;
            status += `• **Bot Username**: @${this.getBotUsername()}\n`;
            status += `• **Connection Time**: ${this.getConnectionTime()}\n`;
        } else {
            status += `• **Telegram API**: ❌ Not Connected\n`;
            status += `• **Bot Username**: Not Available\n`;
            status += `• **Connection Time**: Not Connected\n`;
        }
        status += '\n';
        
        // Active sessions
        status += `**💬 Active Chat Sessions**\n`;
        const activeSessions = this.activeChatSessions.size;
        status += `• **Total Sessions**: ${activeSessions}\n`;
        status += `• **AI-Chatter Enabled**: ${this.getEnabledSessionsCount()}\n`;
        status += `• **Terminal Commands**: ${this.terminalCommandHandler.isTerminalEnabled() ? '✅ Enabled' : '❌ Disabled'}\n`;
        status += `• **Context Monitoring**: ${this.contextSizeHandler.isContextSizeAvailable() ? '✅ Available' : '❌ Not Available'}\n\n`;
        
        // System health
        status += `**💚 System Health**\n`;
        status += `• **Memory Usage**: ${this.getMemoryUsage()}\n`;
        status += `• **Uptime**: ${this.getUptime()}\n`;
        status += `• **Last Activity**: ${this.getLastActivity()}\n\n`;
        
        // Quick actions
        status += `**⚡ Quick Actions**\n`;
        status += `• Use \`/config\` to view configuration\n`;
        status += `• Use \`/users\` to see authorized users\n`;
        status += `• Use \`/context_size\` to check context usage\n`;
        status += `• Use \`/help\` for more commands\n\n`;
        
        status += `**📊 Status Summary**\n`;
        if (this.isRunning && this.bot) {
            status += `🟢 **All Systems Operational**\n`;
            status += `Your AI-Chatter is running smoothly!\n`;
        } else if (this.bot && !this.isRunning) {
            status += `🟡 **Bot Connected but Not Running**\n`;
            status += `Check configuration and restart if needed.\n`;
        } else {
            status += `🔴 **System Issues Detected**\n`;
            status += `Bot is not connected or running.\n`;
        }
        
        return status;
    }

    // Format config message for Telegram
    private formatConfigMessage(): string {
        let config = `⚙️ **AI-Chatter Configuration**\n\n`;
        
        try {
            const telegramConfig = this.configurationManager.getConfiguration();
            const botToken = telegramConfig.botToken;
            const authorizedUsers = telegramConfig.authorizedUsers;
            const maxUsers = telegramConfig.maxUsers;
            
            // Bot configuration
            config += `**🤖 Bot Configuration**\n`;
            config += `• **Bot Token**: ${botToken ? '✅ Configured' : '❌ Not Configured'}\n`;
            config += `• **Token Length**: ${botToken ? botToken.length : 0} characters\n`;
            config += `• **Token Valid**: ${this.isValidBotToken(botToken) ? '✅ Yes' : '❌ No'}\n\n`;
            
            // User configuration
            config += `**👥 User Configuration**\n`;
            config += `• **Authorized Users**: ${authorizedUsers.length}\n`;
            config += `• **Maximum Users**: ${maxUsers}\n`;
            config += `• **User Limit**: ${authorizedUsers.length >= maxUsers ? '⚠️ Reached' : '✅ Available'}\n\n`;
            
            // User list
            if (authorizedUsers.length > 0) {
                config += `**📋 Authorized Users**\n`;
                authorizedUsers.forEach((user: string, index: number) => {
                    config += `• ${index + 1}. @${user}\n`;
                });
                config += '\n';
            } else {
                config += `**📋 Authorized Users**\n`;
                config += `• No users configured yet\n\n`;
            }
            
            // Configuration source
            config += `**📁 Configuration Source**\n`;
            config += `• **Primary**: VS Code Settings\n`;
            config += `• **Fallback**: YAML Configuration\n`;
            config += `• **Last Updated**: ${this.getConfigLastUpdated()}\n\n`;
            
            // Quick actions
            config += `**⚡ Quick Actions**\n`;
            config += `• Use \`/status\` to check system status\n`;
            config += `• Use \`/users\` to see user details\n`;
            config += `• Use \`/help\` for more commands\n\n`;
            
            config += `**💡 Configuration Tips**\n`;
            if (!botToken) {
                config += `• Configure bot token in VS Code settings\n`;
                config += `• Use "AI Chatter: Configure" command\n`;
            }
            if (authorizedUsers.length === 0) {
                config += `• Add authorized users to start using AI-Chatter\n`;
                config += `• Maximum ${maxUsers} users allowed\n`;
            }
            if (authorizedUsers.length >= maxUsers) {
                config += `• User limit reached (${maxUsers})\n`;
                config += `• Remove users to add new ones\n`;
            }
            
        } catch (error) {
            config += `❌ **Error reading configuration**\n`;
            config += `• Error: ${error}\n`;
            config += `• Check VS Code settings and restart extension\n`;
        }
        
        return config;
    }

    // Format users message for Telegram
    private formatUsersMessage(): string {
        let users = `👥 **AI-Chatter Authorized Users**\n\n`;
        
        try {
            const telegramConfig = this.configurationManager.getConfiguration();
            const authorizedUsers = telegramConfig.authorizedUsers;
            const maxUsers = telegramConfig.maxUsers;
            const activeSessions = this.activeChatSessions;
            
            // User summary
            users += `**📊 User Summary**\n`;
            users += `• **Total Users**: ${authorizedUsers.length}\n`;
            users += `• **Maximum Allowed**: ${maxUsers}\n`;
            users += `• **Available Slots**: ${maxUsers - authorizedUsers.length}\n`;
            users += `• **Active Sessions**: ${activeSessions.size}\n\n`;
            
            // User list with details
            if (authorizedUsers.length > 0) {
                users += `**📋 User Details**\n`;
                authorizedUsers.forEach((username: string, index: number) => {
                    const session = activeSessions.get(username);
                    const isActive = session ? '🟢 Active' : '⚪ Inactive';
                    const hasAIChatter = session?.isAIChatterEnabled ? '✅ Enabled' : '❌ Disabled';
                    
                    users += `**${index + 1}. @${username}**\n`;
                    users += `   • Status: ${isActive}\n`;
                    users += `   • AI-Chatter: ${hasAIChatter}\n`;
                    if (session) {
                        users += `   • Last Activity: ${this.formatLastActivity(session.lastMessageTime)}\n`;
                        users += `   • Chat ID: ${session.telegramChatId || 'N/A'}\n`;
                    }
                    users += '\n';
                });
            } else {
                users += `**📋 User Details**\n`;
                users += `• No authorized users configured yet\n`;
                users += `• Add users to start using AI-Chatter\n\n`;
            }
            
            // User management
            users += `**🔧 User Management**\n`;
            users += `• **Add Users**: Use VS Code "AI Chatter: Configure"\n`;
            users += `• **Remove Users**: Remove from configuration\n`;
            users += `• **User Limit**: Maximum ${maxUsers} users\n`;
            users += `• **Permissions**: All users have equal access\n\n`;
            
            // Quick actions
            users += `**⚡ Quick Actions**\n`;
            users += `• Use \`/status\` to check system status\n`;
            users += `• Use \`/config\` to view configuration\n`;
            users += `• Use \`/help\` for more commands\n\n`;
            
            users += `**💡 User Tips**\n`;
            if (authorizedUsers.length === 0) {
                users += `• Add your Telegram username to get started\n`;
                users += `• Configure in VS Code settings\n`;
            } else if (authorizedUsers.length >= maxUsers) {
                users += `• User limit reached (${maxUsers})\n`;
                users += `• Remove inactive users to add new ones\n`;
            } else {
                users += `• ${maxUsers - authorizedUsers.length} user slots available\n`;
                users += `• Add team members or additional devices\n`;
            }
            
        } catch (error) {
            users += `❌ **Error reading user information**\n`;
            users += `• Error: ${error}\n`;
            users += `• Check configuration and restart extension\n`;
        }
        
        return users;
    }

    // Handle cursor AI info command from Telegram
    private async handleCursorAIInfoCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const cursorAIInfo = this.formatCursorAIInfo();
            await this.sendCursorAIInfoResponse(telegramChatId, cursorAIInfo);
        } catch (error) {
            console.error('Error handling cursor AI info command:', error);
            await this.sendCursorAIInfoResponse(telegramChatId, `❌ Error getting cursor AI info: ${error}`);
        }
    }

    // Send cursor AI info response to Telegram
    private async sendCursorAIInfoResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send cursor AI info response to Telegram:', error);
        }
    }

    // Format cursor AI info message for Telegram
    private formatCursorAIInfo(): string {
        let info = `🤖 **Cursor AI Information**\n\n`;
        
        try {
            // Get active chat sessions
            const activeSessions = this.getActiveChatSessions();
            const enabledSessions = activeSessions.filter(session => session.isAIChatterEnabled);
            
            // Cursor AI status
            info += `**📊 Cursor AI Status**\n`;
            info += `• **Total Chat Sessions**: ${activeSessions.length}\n`;
            info += `• **AI-Chatter Enabled**: ${enabledSessions.length}\n`;
            info += `• **Message Callback**: ${this.onMessageReceived ? '✅ Registered' : '❌ Not Registered'}\n`;
            info += `• **Last Message Time**: ${this.getLastActivity()}\n\n`;
            
            // Active sessions details
            if (activeSessions.length > 0) {
                info += `**💬 Active Chat Sessions**\n`;
                activeSessions.forEach((session, index) => {
                    info += `**${index + 1}. Chat ${session.chatId}**\n`;
                    info += `   • AI-Chatter: ${session.isAIChatterEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
                    info += `   • Last Message: ${this.formatLastActivity(session.lastMessageTime)}\n`;
                    info += `   • Telegram Chat ID: ${session.telegramChatId || 'N/A'}\n`;
                    info += `   • Username: @${session.telegramUsername || 'N/A'}\n\n`;
                });
            } else {
                info += `**💬 Active Chat Sessions**\n`;
                info += `• No active chat sessions found\n`;
                info += `• Enable AI-Chatter in a Cursor AI chat tab\n\n`;
            }
            
            // Message routing information
            info += `**📱 Message Routing**\n`;
            info += `• **Callback Function**: ${this.onMessageReceived ? 'Available' : 'Missing'}\n`;
            info += `• **Route Method**: ${this.onMessageReceived ? 'Direct Injection' : 'Fallback Notification'}\n`;
            info += `• **Response Routing**: ${enabledSessions.some(s => s.telegramChatId) ? '✅ Configured' : '❌ Not Configured'}\n\n`;
            
            // Debug information
            info += `**🔍 Debug Information**\n`;
            info += `• **Extension Version**: v0.2.6\n`;
            info += `• **Bot Running**: ${this.isRunning ? 'Yes' : 'No'}\n`;
            info += `• **Bot Connected**: ${this.bot ? 'Yes' : 'No'}\n`;
            info += `• **Configuration Valid**: ${this.configurationManager.hasValidConfiguration() ? 'Yes' : 'No'}\n\n`;
            
            // Quick actions
            info += `**⚡ Quick Actions**\n`;
            info += `• Use \`/status\` to check system status\n`;
            info += `• Use \`/config\` to view configuration\n`;
            info += `• Use \`/users\` to see authorized users\n`;
            info += `• Use \`/help\` for more commands\n\n`;
            
            // Troubleshooting tips
            info += `**💡 Troubleshooting Tips**\n`;
            if (!this.onMessageReceived) {
                info += `• **Issue**: Message callback not registered\n`;
                info += `• **Solution**: Check if AI-Chatter is properly enabled in Cursor AI\n`;
            }
            if (enabledSessions.length === 0) {
                info += `• **Issue**: No AI-Chatter enabled sessions\n`;
                info += `• **Solution**: Enable AI-Chatter in a Cursor AI chat tab\n`;
            }
            if (!this.configurationManager.hasValidConfiguration()) {
                info += `• **Issue**: Invalid configuration\n`;
                info += `• **Solution**: Check bot token and authorized users\n`;
            }
            if (enabledSessions.length > 0 && this.onMessageReceived) {
                info += `• **Status**: All systems operational\n`;
                info += `• **Action**: Try sending a regular message (not a command)\n`;
            }
            
        } catch (error) {
            info += `❌ **Error reading cursor AI information**\n`;
            info += `• Error: ${error}\n`;
            info += `• Check extension configuration and restart if needed\n`;
        }
        
        return info;
    }

    // Handle history command from Telegram
    private async handleHistoryCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const historyMessage = this.formatHistoryMessage();
            await this.sendHistoryResponse(telegramChatId, historyMessage);
        } catch (error) {
            console.error('Error handling history command:', error);
            await this.sendHistoryResponse(telegramChatId, `❌ Error getting message history: ${error}`);
        }
    }

    // Send history response to Telegram
    private async sendHistoryResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send history response to Telegram:', error);
        }
    }

    // Format history message for Telegram
    private formatHistoryMessage(): string {
        let history = `📚 **Message History (Last 10 Messages)**\n\n`;
        
        if (this.messageHistory.length === 0) {
            history += `📭 **No messages in history yet**\n`;
            history += `• Send some messages to start building history\n`;
            history += `• History includes both Telegram messages and AI responses\n\n`;
        } else {
            // Show messages in reverse chronological order (newest first)
            const recentMessages = [...this.messageHistory].reverse();
            
            history += `📊 **History Summary**\n`;
            history += `• **Total Messages**: ${this.messageHistory.length}\n`;
            history += `• **Telegram Messages**: ${this.messageHistory.filter(m => m.type === 'telegram').length}\n`;
            history += `• **AI Responses**: ${this.messageHistory.filter(m => m.type === 'ai_response').length}\n`;
            history += `• **Oldest Message**: ${this.formatTimestamp(this.messageHistory[0]?.timestamp)}\n`;
            history += `• **Newest Message**: ${this.formatTimestamp(this.messageHistory[this.messageHistory.length - 1]?.timestamp)}\n\n`;
            
            history += `📝 **Recent Messages**\n`;
            recentMessages.forEach((msg, index) => {
                const messageNumber = this.messageHistory.length - index;
                const typeIcon = msg.type === 'telegram' ? '📱' : '🤖';
                const typeLabel = msg.type === 'telegram' ? 'Telegram' : 'AI Response';
                const timeAgo = this.formatTimeAgo(msg.timestamp);
                
                history += `**${messageNumber}. ${typeIcon} ${typeLabel}**\n`;
                history += `   • **From**: @${msg.username}\n`;
                history += `   • **Time**: ${timeAgo}\n`;
                history += `   • **Message**: ${this.truncateMessage(msg.message, 100)}\n\n`;
            });
        }
        
        // Quick actions
        history += `**⚡ Quick Actions**\n`;
        history += `• Send a message to add to history\n`;
        history += `• Use \`/status\` to check system status\n`;
        history += `• Use \`/help\` for more commands\n\n`;
        
        history += `**💡 History Tips**\n`;
        if (this.messageHistory.length >= this.maxHistorySize) {
            history += `• History is at maximum size (${this.maxHistorySize} messages)\n`;
            history += `• New messages will replace oldest ones\n`;
        } else {
            history += `• ${this.maxHistorySize - this.messageHistory.length} more messages until history is full\n`;
        }
        history += `• History includes both incoming and outgoing messages\n`;
        history += `• Messages are stored in memory (not persistent)\n`;
        
        return history;
    }

    // Handle tabs command from Telegram
    private async handleTabsCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const tabsMessage = this.formatTabsMessage();
            await this.sendTabsResponse(telegramChatId, tabsMessage);
        } catch (error) {
            console.error('Error handling tabs command:', error);
            await this.sendTabsResponse(telegramChatId, `❌ Error getting tabs information: ${error}`);
        }
    }

    // Send tabs response to Telegram
    private async sendTabsResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send tabs response to Telegram:', error);
        }
    }

    // Format tabs message for Telegram
    private formatTabsMessage(): string {
        let tabs = `📑 **Open Tabs in AI Cursor**\n\n`;
        
        try {
            // Get all open editors
            const openEditors = vscode.workspace.textDocuments;
            const activeEditor = vscode.window.activeTextEditor;
            
            if (openEditors.length === 0) {
                tabs += `📭 **No open tabs found**\n`;
                tabs += `• Open some files or create new ones to see them here\n\n`;
            } else {
                tabs += `📊 **Tabs Summary**\n`;
                tabs += `• **Total Open Tabs**: ${openEditors.length}\n`;
                tabs += `• **Active Tab**: ${activeEditor ? activeEditor.document.fileName.split('/').pop() || 'Unknown' : 'None'}\n\n`;
                
                // Categorize tabs
                const messageTabs: vscode.TextDocument[] = [];
                const codeTabs: vscode.TextDocument[] = [];
                const otherTabs: vscode.TextDocument[] = [];
                
                openEditors.forEach(doc => {
                    if (this.isCursorAIMessageTab(doc)) {
                        messageTabs.push(doc);
                    } else if (this.isCodeFile(doc)) {
                        codeTabs.push(doc);
                    } else {
                        otherTabs.push(doc);
                    }
                });
                
                // Show message tabs first (most important for AI Chatter)
                if (messageTabs.length > 0) {
                    tabs += `💬 **Message Tabs (${messageTabs.length})**\n`;
                    messageTabs.forEach((doc, index) => {
                        const isActive = activeEditor && activeEditor.document === doc;
                        const activeIcon = isActive ? '🎯' : '📝';
                        const fileName = doc.fileName.split('/').pop() || 'Untitled';
                        const filePath = doc.fileName;
                        
                        tabs += `${activeIcon} **${index + 1}. ${fileName}**\n`;
                        tabs += `   • **Path**: \`${filePath}\`\n`;
                        tabs += `   • **Type**: Cursor AI Message Tab\n`;
                        tabs += `   • **Status**: ${isActive ? 'Active' : 'Open'}\n`;
                        tabs += `   • **Lines**: ${doc.lineCount}\n\n`;
                    });
                }
                
                // Show code tabs
                if (codeTabs.length > 0) {
                    tabs += `💻 **Code Files (${codeTabs.length})**\n`;
                    codeTabs.slice(0, 5).forEach((doc, index) => {
                        const isActive = activeEditor && activeEditor.document === doc;
                        const activeIcon = isActive ? '🎯' : '📄';
                        const fileName = doc.fileName.split('/').pop() || 'Untitled';
                        const fileExtension = fileName.split('.').pop() || 'txt';
                        
                        tabs += `${activeIcon} **${index + 1}. ${fileName}**\n`;
                        tabs += `   • **Extension**: \`.${fileExtension}\`\n`;
                        tabs += `   • **Status**: ${isActive ? 'Active' : 'Open'}\n`;
                        tabs += `   • **Lines**: ${doc.lineCount}\n\n`;
                    });
                    
                    if (codeTabs.length > 5) {
                        tabs += `   ... and ${codeTabs.length - 5} more code files\n\n`;
                    }
                }
                
                // Show other tabs
                if (otherTabs.length > 0) {
                    tabs += `📋 **Other Files (${otherTabs.length})**\n`;
                    otherTabs.slice(0, 3).forEach((doc, index) => {
                        const isActive = activeEditor && activeEditor.document === doc;
                        const activeIcon = isActive ? '🎯' : '📋';
                        const fileName = doc.fileName.split('/').pop() || 'Untitled';
                        
                        tabs += `${activeIcon} **${index + 1}. ${fileName}**\n`;
                        tabs += `   • **Status**: ${isActive ? 'Active' : 'Open'}\n`;
                        tabs += `   • **Lines**: ${doc.lineCount}\n\n`;
                    });
                    
                    if (otherTabs.length > 3) {
                        tabs += `   ... and ${otherTabs.length - 3} more files\n\n`;
                    }
                }
                
                // Quick actions
                tabs += `**⚡ Quick Actions**\n`;
                tabs += `• Use \`/context_size\` to check context usage\n`;
                tabs += `• Use \`/status\` to check system status\n`;
                tabs += `• Use \`/help\` for more commands\n\n`;
                
                // Tips
                tabs += `**💡 Tab Management Tips**\n`;
                if (messageTabs.length === 0) {
                    tabs += `• No message tabs found - create one for AI Chatter testing\n`;
                    tabs += `• Message tabs should contain chat-like content (User:, Assistant:)\n`;
                } else {
                    tabs += `• Found ${messageTabs.length} message tab(s) - perfect for AI Chatter\n`;
                    tabs += `• Use \`/context_size\` to monitor context usage in active tab\n`;
                }
                tabs += `• Active tab is marked with 🎯 icon\n`;
                tabs += `• Message tabs are prioritized for AI Chatter integration\n`;
            }
            
        } catch (error) {
            tabs += `❌ **Error getting tabs information**\n`;
            tabs += `• Error: ${error}\n`;
            tabs += `• Try refreshing or restarting the extension\n`;
        }
        
        return tabs;
    }

    // Handle msg command from Telegram
    private async handleMsgCommand(msg: TelegramBot.Message, username: string, telegramChatId: number, messageContent: string): Promise<void> {
        try {
            const result = await this.sendMessageToCursorAI(messageContent, username);
            if (result.success) {
                await this.sendMsgResponse(telegramChatId, `✅ Message sent to Cursor AI: "${messageContent}"`);
            } else {
                await this.sendMsgResponse(telegramChatId, `❌ Failed to send message: ${result.error}`);
            }
        } catch (error) {
            console.error('Error handling msg command:', error);
            await this.sendMsgResponse(telegramChatId, `❌ Error sending message: ${error}`);
        }
    }

    // Send msg response to Telegram
    private async sendMsgResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send msg response to Telegram:', error);
        }
    }

    // Send message directly to Cursor AI input field
    private async sendMessageToCursorAI(message: string, username: string): Promise<{success: boolean; error?: string}> {
        try {
            // Get the active editor
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return { success: false, error: 'No active editor found' };
            }

            // Check if this is a Cursor AI chat tab
            const document = activeEditor.document;
            const isCursorAIChat = this.isCursorAIMessageTab(document);
            
            if (!isCursorAIChat) {
                return { success: false, error: 'Active tab is not a Cursor AI chat' };
            }

            // Insert message into the active editor (simpler approach)
            try {
                const position = activeEditor.selection.active;
                const messageText = `\n\n**Message from Telegram:**\n${message}\n\n`;
                
                await activeEditor.edit(editBuilder => {
                    editBuilder.insert(position, messageText);
                });
                
                // Add message to history
                this.addMessageToHistory(username, message, 'telegram');
                return { success: true };
            } catch (error) {
                console.error('Error inserting message into editor:', error);
                return { success: false, error: 'Failed to insert message into editor' };
            }

        } catch (error) {
            console.error('Error sending message to Cursor AI:', error);
            return { success: false, error: `Error: ${error}` };
        }
    }

    // Note: Direct DOM manipulation of Cursor AI input fields is not possible from VS Code extensions
    // The /msg command inserts messages into the active editor instead

    // Handle msgactive command from Telegram
    private async handleMsgActiveCommand(msg: TelegramBot.Message, username: string, telegramChatId: number, messageContent: string): Promise<void> {
        try {
            const result = await this.sendMessageToActiveElement(messageContent, username);
            if (result.success) {
                await this.sendMsgActiveResponse(telegramChatId, `✅ Message sent to active element: "${messageContent}"`);
            } else {
                await this.sendMsgActiveResponse(telegramChatId, `❌ Failed to send message to active element: ${result.error}`);
            }
        } catch (error) {
            console.error('Error handling msgactive command:', error);
            await this.sendMsgActiveResponse(telegramChatId, `❌ Error sending message to active element: ${error}`);
        }
    }

    // Send msgactive response to Telegram
    private async sendMsgActiveResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send msgactive response to Telegram:', error);
        }
    }

    // Send message to the currently active/focused element
    private async sendMessageToActiveElement(message: string, username: string): Promise<{success: boolean; error?: string}> {
        try {
            // Get the active editor
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return { success: false, error: 'No active editor found' };
            }

            // Check if this is a Cursor AI chat tab
            const document = activeEditor.document;
            const isCursorAIChat = this.isCursorAIMessageTab(document);
            
            if (!isCursorAIChat) {
                return { success: false, error: 'Active tab is not a Cursor AI chat' };
            }

            // Try to interact with the currently active element
            const success = await this.interactWithActiveElement(message);
            
            if (success) {
                // Add message to history
                this.addMessageToHistory(username, message, 'telegram');
                return { success: true };
            } else {
                return { success: false, error: 'Could not interact with active element' };
            }

        } catch (error) {
            console.error('Error sending message to active element:', error);
            return { success: false, error: `Error: ${error}` };
        }
    }

    // Interact with the currently active/focused element
    private async interactWithActiveElement(message: string): Promise<boolean> {
        try {
            // Method 1: Try to find the currently focused input field
            // This would ideally use document.activeElement, but we can't access DOM directly
            // Instead, we'll try to identify the most likely active input area
            
            // Get the active editor position
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return false;
            }

            // Insert message at cursor position with special formatting
            const position = activeEditor.selection.active;
            const messageText = `\n\n**Message to Active Element from Telegram:**\n${message}\n\n`;
            
            await activeEditor.edit(editBuilder => {
                editBuilder.insert(position, messageText);
            });

            // Try to trigger a focus event or selection change to simulate active element interaction
            try {
                // Move cursor to end of inserted message
                const newPosition = new vscode.Position(position.line + 3, message.length);
                activeEditor.selection = new vscode.Selection(newPosition, newPosition);
                
                // Show information about the active element interaction
                vscode.window.showInformationMessage(`📝 Message sent to active element: "${message}"`);
                
                console.log('[ACTIVE_ELEMENT] Message sent to active element via editor interaction');
                return true;
            } catch (e) {
                console.log('[ACTIVE_ELEMENT] Failed to update cursor position:', e);
                // Still consider it successful if the message was inserted
                return true;
            }

        } catch (error) {
            console.error('[ACTIVE_ELEMENT] Error interacting with active element:', error);
            return false;
        }
    }

    // Handle version command from Telegram
    private async handleVersionCommand(msg: TelegramBot.Message, username: string, telegramChatId: number): Promise<void> {
        try {
            const versionInfo = this.getVersionInfo();
            await this.sendVersionResponse(telegramChatId, versionInfo);
        } catch (error) {
            console.error('Error handling version command:', error);
            await this.sendVersionResponse(telegramChatId, '❌ Error getting version information');
        }
    }

    // Send version response to Telegram
    private async sendVersionResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send version response to Telegram:', error);
        }
    }

    // Get version information
    private getVersionInfo(): string {
        const version = '0.2.15';
        const buildDate = new Date().toISOString().split('T')[0];
        
        let versionInfo = `🤖 **AI Chatter Version Information**\n\n`;
        versionInfo += `**📱 Current Version**: v${version}\n`;
        versionInfo += `**📅 Build Date**: ${buildDate}\n`;
        versionInfo += `**🔧 Platform**: VS Code Extension\n`;
        versionInfo += `**🌐 Repository**: [GitHub](https://github.com/j0k/ai_chatter)\n\n`;
        
        versionInfo += `**📋 Recent Features**\n`;
        versionInfo += `• v0.2.15: Fixed cheat command DOM modification and active editor targeting\n`;
        versionInfo += `• v0.2.14: Enhanced DOM search and injection capabilities\n`;
        versionInfo += `• v0.2.13: Version info and advanced text manipulation\n`;
        versionInfo += `• v0.2.12: Active element messaging (/msgactive)\n`;
        versionInfo += `• v0.2.11: Direct messaging (/msg)\n`;
        versionInfo += `• v0.2.10: Restart button and bot management\n`;
        versionInfo += `• v0.2.9: Tabs command and enhanced help\n\n`;
        
        versionInfo += `**🔧 v0.2.15 Fixes**\n`;
        versionInfo += `• Fixed cheat command not adding text after found patterns\n`;
        versionInfo += `• Enhanced active editor content modification\n`;
        versionInfo += `• Improved webview DOM manipulation success rate\n`;
        versionInfo += `• Better error handling and success notifications\n\n`;
        
        versionInfo += `**🚀 Use /help for all available commands**\n`;
        versionInfo += `**📚 Use /usage for detailed examples**`;
        
        return versionInfo;
    }

    // Handle cheat command from Telegram
    private async handleCheatCommand(msg: TelegramBot.Message, username: string, telegramChatId: number, cheatContent: string): Promise<void> {
        try {
            const result = await this.executeCheatCommand(cheatContent, username);
            if (result.success) {
                await this.sendCheatResponse(telegramChatId, `✅ Cheat executed successfully: "${result.message}"`);
            } else {
                await this.sendCheatResponse(telegramChatId, `❌ Cheat failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Error handling cheat command:', error);
            await this.sendCheatResponse(telegramChatId, `❌ Error executing cheat: ${error}`);
        }
    }

    // Send cheat response to Telegram
    private async sendCheatResponse(telegramChatId: number, message: string): Promise<void> {
        if (!this.bot) return;

        try {
            await this.bot.sendMessage(telegramChatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Failed to send cheat response to Telegram:', error);
        }
    }

    // Execute cheat command - find and modify text in documents AND DOM elements
    private async executeCheatCommand(cheatContent: string, username: string): Promise<{success: boolean; message?: string; error?: string}> {
        try {
            // Parse cheat command: "HHHHE HHHHE111" -> find "HHHHE" and add "HHHHE111"
            const spaceIndex = cheatContent.indexOf(' ');
            if (spaceIndex === -1) {
                return { success: false, error: 'Invalid cheat format. Use: /cheat <search_text> <add_text>' };
            }

            const searchText = cheatContent.substring(0, spaceIndex);
            const addText = cheatContent.substring(spaceIndex + 1);

            if (!searchText || !addText) {
                return { success: false, error: 'Both search text and add text are required' };
            }

            let totalReplacements = 0;
            let modifiedDocuments = 0;
            let modifiedDOMElements = 0;

            // Method 1: Search in open text documents (existing functionality)
            const documents = vscode.workspace.textDocuments;
            for (const document of documents) {
                try {
                    const content = document.getText();
                    const searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    const matches = content.match(searchRegex);
                    
                    if (matches && matches.length > 0) {
                        // Replace all occurrences
                        const newContent = content.replace(searchRegex, searchText + addText);
                        
                        // Apply the changes
                        const edit = new vscode.WorkspaceEdit();
                        const fullRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(content.length)
                        );
                        edit.replace(document.uri, fullRange, newContent);
                        
                        await vscode.workspace.applyEdit(edit);
                        totalReplacements += matches.length;
                        modifiedDocuments++;
                        
                        console.log(`[CHEAT] Modified document ${document.fileName}: ${matches.length} replacements`);
                    }
                } catch (docError) {
                    console.error(`[CHEAT] Error processing document ${document.fileName}:`, docError);
                    continue;
                }
            }

            // Method 2: Search and modify DOM elements in all webviews
            try {
                const domResults = await this.searchAndModifyDOM(searchText, addText);
                totalReplacements += domResults.replacements;
                modifiedDOMElements += domResults.elements;
                console.log(`[CHEAT] Modified DOM elements: ${domResults.replacements} replacements in ${domResults.elements} elements`);
            } catch (domError) {
                console.error('[CHEAT] Error processing DOM elements:', domError);
                // Continue with document results even if DOM fails
            }

            if (totalReplacements > 0) {
                // Add to history
                this.addMessageToHistory(username, `Cheat: "${searchText}" + "${addText}" (${totalReplacements} replacements in ${modifiedDocuments} files + ${modifiedDOMElements} DOM elements)`, 'telegram');
                
                let message = `Found "${searchText}" and added "${addText}" after each occurrence:\n`;
                if (modifiedDocuments > 0) {
                    message += `• Documents: ${modifiedDocuments} file(s) modified\n`;
                }
                if (modifiedDOMElements > 0) {
                    message += `• DOM Elements: ${modifiedDOMElements} element(s) modified\n`;
                }
                message += `• Total Replacements: ${totalReplacements}`;
                
                return { success: true, message };
            } else {
                return { 
                    success: false, 
                    error: `No occurrences of "${searchText}" found in any open documents or DOM elements\n\n**What was searched**:\n• Open text documents (files)\n• Webview panels (if any exist)\n• Active editor content\n\n**Tip**: Make sure you have text files open with the content you want to modify` 
                };
            }

        } catch (error) {
            console.error('Error executing cheat command:', error);
            return { success: false, error: `Error: ${error}` };
        }
    }

    // Search and modify DOM elements in all webviews
    private async searchAndModifyDOM(searchText: string, addText: string): Promise<{replacements: number; elements: number}> {
        let totalReplacements = 0;
        let modifiedElements = 0;

        try {
            // Get all active webview panels
            const webviewPanels = vscode.window.visibleTextEditors
                .filter(editor => editor.document.uri.scheme === 'webview-panel')
                .map(editor => editor.document.uri);

            // Also try to get webview panels from the extension
            const extensionWebviews = this.getExtensionWebviews();

            // Combine all webview sources
            const allWebviews = [...webviewPanels, ...extensionWebviews];

            if (allWebviews.length === 0) {
                console.log('[CHEAT] No webview panels found for DOM manipulation');
            } else {
                console.log(`[CHEAT] Found ${allWebviews.length} webview panels for DOM manipulation`);
                
                for (const webviewUri of allWebviews) {
                    try {
                        const results = await this.modifyWebviewDOM(webviewUri, searchText, addText);
                        totalReplacements += results.replacements;
                        if (results.replacements > 0) {
                            modifiedElements++;
                        }
                    } catch (webviewError) {
                        console.error(`[CHEAT] Error processing webview ${webviewUri}:`, webviewError);
                        continue;
                    }
                }
            }

            // Try to inject script into active webviews for DOM manipulation
            const webviewResults = await this.injectDOMScript(searchText, addText);
            totalReplacements += webviewResults.replacements || 0;
            if (webviewResults.replacements > 0) {
                modifiedElements++;
            }

            // NEW: Try to modify active editor content directly
            const activeEditorResults = await this.modifyActiveEditorContent(searchText, addText);
            totalReplacements += activeEditorResults.replacements;
            if (activeEditorResults.replacements > 0) {
                modifiedElements++;
            }

        } catch (error) {
            console.error('[CHEAT] Error in DOM search and modify:', error);
        }

        return { replacements: totalReplacements, elements: modifiedElements };
    }

    // Get extension webviews
    private getExtensionWebviews(): vscode.Uri[] {
        const webviews: vscode.Uri[] = [];
        
        try {
            // Look for webview panels in the extension
            // This is a fallback method since direct webview access is limited
            const webviewPanels = vscode.window.visibleTextEditors
                .filter(editor => editor.document.uri.scheme === 'webview-panel')
                .map(editor => editor.document.uri);
            webviews.push(...webviewPanels);
        } catch (error) {
            console.error('[CHEAT] Error getting extension webviews:', error);
        }

        return webviews;
    }

    // Modify webview DOM content
    private async modifyWebviewDOM(webviewUri: vscode.Uri, searchText: string, addText: string): Promise<{replacements: number}> {
        let replacements = 0;

        try {
            // Try to get the webview content
            const document = vscode.workspace.openTextDocument(webviewUri);
            if (document) {
                const content = await document;
                const text = content.getText();
                const searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                const matches = text.match(searchRegex);
                
                if (matches && matches.length > 0) {
                    // Replace content
                    const newContent = text.replace(searchRegex, searchText + addText);
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        content.positionAt(0),
                        content.positionAt(text.length)
                    );
                    edit.replace(webviewUri, fullRange, newContent);
                    await vscode.workspace.applyEdit(edit);
                    replacements = matches.length;
                }
            }
        } catch (error) {
            console.error(`[CHEAT] Error modifying webview DOM ${webviewUri}:`, error);
        }

        return { replacements };
    }

    // Inject DOM manipulation script into active webviews
    private async injectDOMScript(searchText: string, addText: string): Promise<{replacements: number}> {
        let replacements = 0;
        
        try {
            // Create a command to inject DOM script
            const command = `ai-chatter.injectDOMScript`;
            const args = { searchText, addText };
            
            // Execute the command if it exists
            try {
                await vscode.commands.executeCommand(command, args);
            } catch (cmdError) {
                console.log('[CHEAT] DOM injection command not available, trying alternative method');
                const result = await this.alternativeDOMModification(searchText, addText);
                replacements = result.replacements || 0;
            }
        } catch (error) {
            console.error('[CHEAT] Error injecting DOM script:', error);
        }
        
        return { replacements };
    }

    // Alternative DOM modification method
    private async alternativeDOMModification(searchText: string, addText: string): Promise<{replacements: number}> {
        let replacements = 0;
        
        try {
            // Try to find and modify text in the active editor
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const document = activeEditor.document;
                const content = document.getText();
                const searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                const matches = content.match(searchRegex);
                
                if (matches && matches.length > 0) {
                    // Replace in active editor
                    const newContent = content.replace(searchRegex, searchText + addText);
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(content.length)
                    );
                    edit.replace(document.uri, fullRange, newContent);
                    await vscode.workspace.applyEdit(edit);
                    
                    replacements = matches.length;
                    console.log(`[CHEAT] Alternative method: Modified active editor with ${replacements} replacements`);
                }
            }

            // Try to send message to webview panels
            await this.sendMessageToWebviews(searchText, addText);

        } catch (error) {
            console.error('[CHEAT] Error in alternative DOM modification:', error);
        }
        
        return { replacements };
    }

    // Send message to webview panels
    private async sendMessageToWebviews(searchText: string, addText: string): Promise<void> {
        try {
            // This is a placeholder for webview communication
            // In a real implementation, we would need to establish communication channels
            console.log(`[CHEAT] Would send DOM modification request: search="${searchText}", add="${addText}"`);
            
            // Try to find webview panels and send messages
            const webviewPanels = vscode.window.visibleTextEditors
                .filter(editor => editor.document.uri.scheme === 'webview-panel');
            
            for (const editor of webviewPanels) {
                try {
                    // Try to post message to webview
                    // Note: This requires proper webview setup and message handling
                    console.log(`[CHEAT] Found webview panel: ${editor.document.uri}`);
                } catch (webviewError) {
                    console.error(`[CHEAT] Error with webview panel ${editor.document.uri}:`, webviewError);
                }
            }
        } catch (error) {
            console.error('[CHEAT] Error sending message to webviews:', error);
        }
    }

    // NEW: Modify active editor content directly for cheat command
    private async modifyActiveEditorContent(searchText: string, addText: string): Promise<{replacements: number}> {
        let replacements = 0;

        try {
            // Get the currently active editor
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                console.log('[CHEAT] No active editor found for direct modification');
                return { replacements: 0 };
            }

            const document = activeEditor.document;
            const content = document.getText();
            
            // Check if content contains the search text
            if (content.includes(searchText)) {
                console.log(`[CHEAT] Found "${searchText}" in active editor: ${document.fileName}`);
                
                // Create regex for global replacement
                const searchRegex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                const matches = content.match(searchRegex);
                
                if (matches && matches.length > 0) {
                    // Replace all occurrences with searchText + addText
                    const newContent = content.replace(searchRegex, searchText + addText);
                    
                    // Apply the changes using WorkspaceEdit
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(content.length)
                    );
                    edit.replace(document.uri, fullRange, newContent);
                    
                    const success = await vscode.workspace.applyEdit(edit);
                    if (success) {
                        replacements = matches.length;
                        console.log(`[CHEAT] Successfully modified active editor: ${replacements} replacements`);
                        
                        // Show success notification
                        vscode.window.showInformationMessage(`✅ Cheat: Modified "${searchText}" → "${searchText}${addText}" in active editor (${replacements} replacements)`);
                    } else {
                        console.error('[CHEAT] Failed to apply edit to active editor');
                    }
                }
            } else {
                console.log(`[CHEAT] No "${searchText}" found in active editor: ${document.fileName}`);
            }

        } catch (error) {
            console.error('[CHEAT] Error modifying active editor content:', error);
        }

        return { replacements };
    }

    // Check if document is a Cursor AI message tab
    private isCursorAIMessageTab(document: vscode.TextDocument): boolean {
        const content = document.getText();
        const fileName = document.fileName.toLowerCase();
        
        // Check for common Cursor AI patterns
        const hasCursorAIPatterns = 
            content.includes('User:') || 
            content.includes('Assistant:') || 
            content.includes('Cursor AI') ||
            content.includes('AI Chat') ||
            content.includes('Chat History') ||
            content.includes('Conversation History');
        
        // Check if file name suggests it's a chat
        const isChatFile = 
            fileName.includes('chat') || 
            fileName.includes('ai') || 
            fileName.includes('conversation') ||
            fileName.includes('cursor') ||
            fileName.includes('message');
        
        return hasCursorAIPatterns || isChatFile;
    }

    // Check if document is a code file
    private isCodeFile(document: vscode.TextDocument): boolean {
        const fileName = document.fileName.toLowerCase();
        const codeExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
            '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html',
            '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml', '.md'
        ];
        
        return codeExtensions.some(ext => fileName.endsWith(ext));
    }

    // Add message to history
    private addMessageToHistory(username: string, message: string, type: 'telegram' | 'ai_response'): void {
        const historyEntry = {
            username,
            message,
            timestamp: Date.now(),
            type
        };
        
        // Add to history
        this.messageHistory.push(historyEntry);
        
        // Keep only the last maxHistorySize messages
        if (this.messageHistory.length > this.maxHistorySize) {
            this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
        }
        
        console.log(`[HISTORY] Added ${type} message from @${username}: "${this.truncateMessage(message, 50)}"`);
    }

    // Add AI response to history
    public addAIResponseToHistory(username: string, response: string): void {
        this.addMessageToHistory(username, response, 'ai_response');
    }

    // Get message history
    public getMessageHistory(): Array<{username: string; message: string; timestamp: number; type: 'telegram' | 'ai_response'}> {
        return [...this.messageHistory];
    }

    // Clear message history
    public clearMessageHistory(): void {
        this.messageHistory = [];
        console.log('[HISTORY] Message history cleared');
    }

    // Helper methods for history formatting
    private truncateMessage(message: string, maxLength: number): string {
        if (message.length <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength) + '...';
    }

    private formatTimestamp(timestamp: number | undefined): string {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    }

    private formatTimeAgo(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return `${Math.floor(minutes / 1440)}d ago`;
    }

    // Helper methods for status formatting
    private getConnectionTime(): string {
        // For now, return a placeholder - could be enhanced with actual connection tracking
        return 'Since startup';
    }

    private getEnabledSessionsCount(): number {
        let count = 0;
        for (const session of this.activeChatSessions.values()) {
            if (session.isAIChatterEnabled) count++;
        }
        return count;
    }

    private getMemoryUsage(): string {
        const memUsage = process.memoryUsage();
        const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        return `${usedMB}MB / ${totalMB}MB`;
    }

    private getUptime(): string {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    private getLastActivity(): string {
        // For now, return current time - could be enhanced with actual activity tracking
        return new Date().toLocaleString();
    }

    private getConfigLastUpdated(): string {
        // For now, return current time - could be enhanced with actual config tracking
        return new Date().toLocaleString();
    }

    private isValidBotToken(token: string | undefined): boolean {
        if (!token) return false;
        // Basic validation: Telegram bot tokens are typically 46 characters and start with numbers
        return token.length >= 40 && /^\d+/.test(token);
    }

    private formatLastActivity(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return `${Math.floor(minutes / 1440)}d ago`;
    }

    private getBotUsername(): string {
        // For now, return a placeholder - could be enhanced with actual bot info
        return 'ai_chatter_bot';
    }

    // Format AI response for Telegram
    private formatResponseForTelegram(response: string, username?: string): string {
        let formatted = response;

        // Add header if username is available
        if (username) {
            formatted = `🤖 **AI Response for @${username}**\n\n${formatted}`;
        } else {
            formatted = `🤖 **AI Response**\n\n${formatted}`;
        }

        // Handle code blocks for Telegram Markdown
        formatted = formatted.replace(/```(\w+)?\n/g, '```$1\n');
        formatted = formatted.replace(/```\n/g, '```\n');

        // Truncate if too long (Telegram has 4096 character limit)
        if (formatted.length > 4000) {
            formatted = formatted.substring(0, 4000) + '\n\n... (response truncated due to length)';
        }

        return formatted;
    }

    async startBot(): Promise<void> {
        if (this.isRunning) {
            throw new Error('Bot is already running');
        }

        const config = this.configurationManager.getConfiguration();
        if (!config.botToken) {
            throw new Error('Bot token not configured. Please run "AI Chatter: Configure" first.');
        }

        if (config.authorizedUsers.length === 0) {
            throw new Error('No authorized users configured. Please run "AI Chatter: Configure" first.');
        }

        try {
            this.bot = new TelegramBot(config.botToken, { polling: true });
            this.setupMessageHandlers();
            this.isRunning = true;
            
            console.log('AI Chatter bot started successfully');
        } catch (error) {
            this.isRunning = false;
            this.bot = null;
            throw new Error(`Failed to start bot: ${error}`);
        }
    }

    async stopBot(): Promise<void> {
        if (!this.isRunning || !this.bot) {
            return;
        }

        try {
            await this.bot.stopPolling();
            this.bot = null;
            this.isRunning = false;
            console.log('AI Chatter bot stopped successfully');
        } catch (error) {
            console.error('Error stopping bot:', error);
            throw new Error(`Failed to stop bot: ${error}`);
        }
    }

    private setupMessageHandlers(): void {
        if (!this.bot) return;

        this.bot.on('message', async (msg) => {
            await this.handleMessage(msg);
        });

        this.bot.on('error', (error) => {
            console.error('Telegram bot error:', error);
            vscode.window.showErrorMessage(`Telegram bot error: ${error.message}`);
        });

        this.bot.on('polling_error', (error) => {
            console.error('Telegram polling error:', error);
            vscode.window.showErrorMessage(`Telegram polling error: ${error.message}`);
        });
    }

    private async handleMessage(msg: TelegramBot.Message): Promise<void> {
        if (!msg.from?.username) {
            return;
        }

        const config = this.configurationManager.getConfiguration();
        const username = msg.from.username;

        // Check if user is authorized
        if (!config.authorizedUsers.includes(username)) {
            console.log(`Unauthorized user ${username} tried to send message`);
            if (this.bot) {
                await this.bot.sendMessage(msg.chat.id, 'You are not authorized to use this bot.');
            }
            return;
        }

        // Process authorized message
        console.log(`Received message from ${username}: ${msg.text}`);
        await this.processAuthorizedMessage(msg);
    }

    private async processAuthorizedMessage(msg: TelegramBot.Message): Promise<void> {
        if (!msg.text) return;

        const username = msg.from?.username || 'Unknown';
        const messageText = msg.text;
        const telegramChatId = msg.chat.id;

        // Check for terminal commands first
        if (messageText.startsWith('/terminal ')) {
            await this.handleTerminalCommand(msg, username, messageText, telegramChatId);
            return;
        }

        // Check for context size command
        if (messageText === '/context_size') {
            await this.handleContextSizeCommand(msg, username, telegramChatId);
            return;
        }

        // Check for help command
        if (messageText === '/help') {
            await this.handleHelpCommand(msg, username, telegramChatId);
            return;
        }

        // Check for usage command
        if (messageText === '/usage') {
            await this.handleUsageCommand(msg, username, telegramChatId);
            return;
        }

        // Check for setup commands
        if (messageText === '/status') {
            await this.handleStatusCommand(msg, username, telegramChatId);
            return;
        }

        if (messageText === '/config') {
            await this.handleConfigCommand(msg, username, telegramChatId);
            return;
        }

        if (messageText === '/users') {
            await this.handleUsersCommand(msg, username, telegramChatId);
            return;
        }

        // Check for cursor AI info command
        if (messageText === '/info cursor_ai') {
            await this.handleCursorAIInfoCommand(msg, username, telegramChatId);
            return;
        }

        // Check for history command
        if (messageText === '/history') {
            await this.handleHistoryCommand(msg, username, telegramChatId);
            return;
        }

        // Check for tabs command
        if (messageText === '/tabs') {
            await this.handleTabsCommand(msg, username, telegramChatId);
            return;
        }

        // Check for msg command
        if (messageText.startsWith('/msg ')) {
            const messageContent = messageText.substring(5); // Remove '/msg ' prefix
            await this.handleMsgCommand(msg, username, telegramChatId, messageContent);
            return;
        }

        // Check for msgactive command
        if (messageText.startsWith('/msgactive ')) {
            const messageContent = messageText.substring(11); // Remove '/msgactive ' prefix
            await this.handleMsgActiveCommand(msg, username, telegramChatId, messageContent);
            return;
        }

        // Check for version command
        if (messageText === '/version') {
            await this.handleVersionCommand(msg, username, telegramChatId);
            return;
        }

        // Check for cheat command
        if (messageText.startsWith('/cheat ')) {
            const cheatContent = messageText.substring(7); // Remove '/cheat ' prefix
            await this.handleCheatCommand(msg, username, telegramChatId, cheatContent);
            return;
        }

        // Add message to history
        this.addMessageToHistory(username, messageText, 'telegram');
        
        // Check if we have any active chat sessions with AI-Chatter enabled
        const activeSessions = this.getActiveChatSessions();
        
        console.log(`[DEBUG] Processing message from @${username}: "${messageText}"`);
        console.log(`[DEBUG] Active sessions: ${activeSessions.length}`);
        console.log(`[DEBUG] Message callback registered: ${!!this.onMessageReceived}`);
        
        if (activeSessions.length > 0) {
            console.log(`[DEBUG] Found ${activeSessions.length} active sessions, routing message`);
            // Route message to active chat sessions and store Telegram info
            this.routeMessageToChats(username, messageText, telegramChatId);
        } else {
            console.log(`[DEBUG] No active sessions found, showing fallback notification`);
            // Fallback to old behavior (notifications)
            this.showFallbackNotification(username, messageText);
        }

        // Send confirmation to user
        if (this.bot && telegramChatId) {
            await this.bot.sendMessage(telegramChatId, '✅ Message received and sent to Cursor AI! Waiting for response...');
        }
    }

    private routeMessageToChats(username: string, message: string, telegramChatId: number): void {
        console.log(`[DEBUG] routeMessageToChats called for @${username}`);
        console.log(`[DEBUG] Message callback available: ${!!this.onMessageReceived}`);
        
        // Call the registered callback to inject message into Cursor AI chat
        if (this.onMessageReceived) {
            console.log(`[DEBUG] Calling message callback for @${username}: "${message}"`);
            this.onMessageReceived(username, message);
        } else {
            console.log(`[DEBUG] No message callback registered!`);
        }

        // Update active chat sessions with Telegram info for response routing
        const activeSessions = this.getActiveChatSessions();
        console.log(`[DEBUG] Updating ${activeSessions.length} active sessions with Telegram info`);
        
        for (const session of activeSessions) {
            if (session.isAIChatterEnabled) {
                console.log(`[DEBUG] Updating session ${session.chatId} with Telegram info`);
                // Update session with Telegram info for response routing
                session.telegramChatId = telegramChatId;
                session.telegramUsername = username;
                break; // Use the first active session
            }
        }

        // Log to output channel for debugging
        this.logToOutput(`[Telegram → Chat] @${username}: ${message} (Chat ID: ${telegramChatId})`);
    }

    private showFallbackNotification(username: string, message: string): void {
        // Fallback behavior when no chats have AI-Chatter enabled
        const formattedMessage = `[Telegram] @${username}: ${message}`;
        
        // Show message in VS Code
        vscode.window.showInformationMessage(formattedMessage);
        
        // Log to output channel
        this.logToOutput(formattedMessage);
    }

    private logToOutput(message: string): void {
        const outputChannel = vscode.window.createOutputChannel('AI Chatter');
        outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
        outputChannel.show();
    }

    getStatus(): string {
        if (this.isRunning && this.bot) {
            return 'Running';
        } else if (this.isRunning) {
            return 'Starting...';
        } else {
            return 'Stopped';
        }
    }

    isBotRunning(): boolean {
        return this.isRunning;
    }
}
