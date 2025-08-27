import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private telegramBotManager: TelegramBotManager;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor(telegramBotManager: TelegramBotManager) {
        this.telegramBotManager = telegramBotManager;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.name = 'AI Chatter Status';
        this.statusBarItem.tooltip = 'Click to show AI Chatter status';
        this.statusBarItem.command = 'ai-chatter.status';
    }

    initialize(): void {
        this.statusBarItem.show();
        this.updateStatus();
        
        // Update status every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateStatus();
        }, 5000);
    }

    private updateStatus(): void {
        const status = this.telegramBotManager.getStatus();
        const isRunning = this.telegramBotManager.isBotRunning();
        
        switch (status) {
            case 'Running':
                this.statusBarItem.text = '$(radio-tower) AI Chatter';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
                this.statusBarItem.tooltip = 'AI Chatter Bot is running';
                break;
            case 'Starting...':
                this.statusBarItem.text = '$(sync~spin) AI Chatter';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                this.statusBarItem.tooltip = 'AI Chatter Bot is starting...';
                break;
            case 'Stopped':
            default:
                this.statusBarItem.text = '$(circle-slash) AI Chatter';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.tooltip = 'AI Chatter Bot is stopped';
                break;
        }
    }

    dispose(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.statusBarItem.dispose();
    }
}
