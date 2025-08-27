import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';

export interface MessageTabState {
    isAIChatterEnabled: boolean;
    isVisible: boolean;
    position: 'left' | 'right';
}

export class MessageTabIntegration {
    private telegramBotManager: TelegramBotManager;
    private statusBarItem: vscode.StatusBarItem;
    private isActive: boolean = false;
    private currentMessageTab: string | null = null;

    constructor(telegramBotManager: TelegramBotManager) {
        this.telegramBotManager = telegramBotManager;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.setupMessageTabDetection();
    }

    private setupMessageTabDetection(): void {
        // Listen for various events that might indicate message tab activity
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.detectMessageTab();
        });

        vscode.workspace.onDidChangeTextDocument(() => {
            this.detectMessageTab();
        });

        // Note: Webview panel events are handled differently in VS Code
        // We'll use alternative detection methods
        // vscode.window.onDidChangeWebviewPanelViewState(() => {
        //     this.detectMessageTab();
        // });
    }

    private detectMessageTab(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.hideIntegration();
            return;
        }

        const document = editor.document;
        const content = document.getText();
        
        // Enhanced detection for message tab interface
        if (this.isMessageTabInterface(content, document)) {
            this.currentMessageTab = `message_${document.uri.toString()}`;
            this.showIntegration();
        } else {
            this.hideIntegration();
        }
    }

    private isMessageTabInterface(content: string, document: vscode.TextDocument): boolean {
        // Look for message tab specific patterns
        const hasMessageTabIndicators = 
            content.includes('Agent') ||
            content.includes('Auto') ||
            content.includes('1 Tab') ||
            content.includes('@') ||
            content.includes('⌘I') ||
            content.includes('∞') ||
            document.fileName.includes('chat') ||
            document.fileName.includes('message') ||
            document.uri.scheme === 'vscode-webview';

        // Look for chat-like content structure
        const hasChatStructure = 
            content.includes('User:') ||
            content.includes('Assistant:') ||
            content.includes('AI:') ||
            content.includes('```') ||
            content.includes('@username');

        return hasMessageTabIndicators || hasChatStructure;
    }

    private showIntegration(): void {
        if (this.isActive) return;
        
        this.isActive = true;
        this.updateStatusBar();
        this.statusBarItem.show();
        
        console.log('AI-Chatter message tab integration activated');
    }

    private hideIntegration(): void {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.statusBarItem.hide();
        this.currentMessageTab = null;
        
        console.log('AI-Chatter message tab integration deactivated');
    }

    private updateStatusBar(): void {
        if (this.currentMessageTab && this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab)) {
            this.statusBarItem.text = '$(radio-tower) AI-Chatter [ON]';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
            this.statusBarItem.tooltip = 'AI-Chatter is enabled for this message tab. Click to disable.';
        } else {
            this.statusBarItem.text = '$(radio-tower) AI-Chatter [OFF]';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            this.statusBarItem.tooltip = 'AI-Chatter is disabled for this message tab. Click to enable.';
        }
        
        this.statusBarItem.command = 'ai-chatter.toggleMessageTab';
    }

    // Toggle AI-Chatter for the current message tab
    toggleForCurrentMessageTab(): void {
        if (!this.currentMessageTab) {
            vscode.window.showWarningMessage('No message tab detected. Please open a Cursor AI message tab first.');
            return;
        }

        if (this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab)) {
            this.telegramBotManager.disableAIChatterForChat(this.currentMessageTab);
            vscode.window.showInformationMessage('AI-Chatter disabled for this message tab');
        } else {
            this.telegramBotManager.enableAIChatterForChat(this.currentMessageTab);
            vscode.window.showInformationMessage('AI-Chatter enabled for this message tab');
        }
        
        this.updateStatusBar();
    }

    // Get current message tab status
    getCurrentMessageTabStatus(): { tabId: string | null; isEnabled: boolean; isVisible: boolean } {
        if (!this.currentMessageTab) {
            return { tabId: null, isEnabled: false, isVisible: false };
        }
        
        return {
            tabId: this.currentMessageTab,
            isEnabled: this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab),
            isVisible: this.isActive
        };
    }

    // Force refresh message tab detection
    refreshDetection(): void {
        this.detectMessageTab();
    }

    // Dispose resources
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
