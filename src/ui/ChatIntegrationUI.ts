import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';
import { CursorAIIntegration } from './CursorAIIntegration';

export class ChatIntegrationUI {
    private telegramBotManager: TelegramBotManager;
    private cursorAIIntegration: CursorAIIntegration;
    private statusBarItem: vscode.StatusBarItem;

    constructor(telegramBotManager: TelegramBotManager) {
        this.telegramBotManager = telegramBotManager;
        this.cursorAIIntegration = new CursorAIIntegration();
        this.cursorAIIntegration.setTelegramBotManager(telegramBotManager);
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.setupMessageHandling();
    }

    private setupMessageHandling(): void {
        // Register callback for when Telegram messages are received
        this.telegramBotManager.onTelegramMessage((username: string, message: string) => {
            this.injectMessageIntoChat(username, message);
        });
    }

    // Initialize the chat integration UI
    initialize(): void {
        this.statusBarItem.text = '$(radio-tower) AI-Chatter';
        this.statusBarItem.tooltip = 'Click to toggle AI-Chatter for current chat';
        this.statusBarItem.command = 'ai-chatter.toggleChat';
        this.statusBarItem.show();

        // Listen for chat changes
        this.setupChatChangeListener();
        
        // Force initial chat detection
        this.cursorAIIntegration.refreshChatDetection();
    }

    private setupChatChangeListener(): void {
        // Listen for editor changes to detect chat context
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.updateChatContext();
        });
    }

    private updateChatContext(): void {
        // Use the Cursor AI integration to detect chat context
        this.cursorAIIntegration.refreshChatDetection();
        this.updateStatusBar();
    }

    private updateStatusBar(): void {
        const chatStatus = this.cursorAIIntegration.getCurrentChatStatus();
        
        if (chatStatus.hasChat) {
            if (chatStatus.isEnabled) {
                this.statusBarItem.text = '$(radio-tower) AI-Chatter [ON]';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                this.statusBarItem.tooltip = 'AI-Chatter is enabled for this chat. Click to disable.';
            } else {
                this.statusBarItem.text = '$(radio-tower) AI-Chatter [OFF]';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.tooltip = 'AI-Chatter is disabled for this chat. Click to enable.';
            }
        } else {
            this.statusBarItem.text = '$(radio-tower) AI-Chatter [NO CHAT]';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.tooltip = 'No chat detected. Open a chat to enable AI-Chatter.';
        }
    }

    // Toggle AI-Chatter for the current chat
    toggleAIChatterForCurrentChat(): void {
        const chatStatus = this.cursorAIIntegration.getCurrentChatStatus();
        
        if (!chatStatus.hasChat) {
            vscode.window.showWarningMessage('No chat detected. Please open a Cursor AI chat first.');
            return;
        }

        if (chatStatus.isEnabled) {
            this.cursorAIIntegration.disableForCurrentChat();
            vscode.window.showInformationMessage('AI-Chatter disabled for this chat');
        } else {
            this.cursorAIIntegration.enableForCurrentChat();
            vscode.window.showInformationMessage('AI-Chatter enabled for this chat');
        }
        
        this.updateStatusBar();
    }

    // Inject Telegram message into the current chat
    private injectMessageIntoChat(username: string, message: string): void {
        if (!this.cursorAIIntegration.isEnabledForCurrentChat()) {
            return;
        }

        // Try to inject the message into the Cursor AI chat
        const success = this.cursorAIIntegration.injectMessage(username, message);
        
        if (success) {
            vscode.window.showInformationMessage(`Telegram message from @${username} injected into chat!`);
        } else {
            // Fallback: show in output panel
            this.logToOutput(`[Telegram] @${username}: ${message}`);
            vscode.window.showWarningMessage(`Failed to inject message. Check output panel for details.`);
        }
    }

    private logToOutput(message: string): void {
        const outputChannel = vscode.window.createOutputChannel('AI Chatter Chat');
        outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
        outputChannel.show();
    }

    // Get current chat status
    getCurrentChatStatus(): { chatId: string | null; isEnabled: boolean; hasChat: boolean } {
        return this.cursorAIIntegration.getCurrentChatStatus();
    }

    // Dispose resources
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
