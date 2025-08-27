import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';

export interface CursorAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export class CursorAIIntegration {
    private isEnabled: boolean = false;
    private currentChatId: string | null = null;
    private telegramBotManager: TelegramBotManager | null = null;

    constructor() {
        this.setupChatDetection();
    }

    // Set the telegram bot manager for session registration
    setTelegramBotManager(manager: TelegramBotManager): void {
        this.telegramBotManager = manager;
    }

    private setupChatDetection(): void {
        // Listen for various VS Code events that might indicate chat activity
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.detectChatContext();
        });

        vscode.workspace.onDidChangeTextDocument(() => {
            this.detectChatContext();
        });

        // Listen for webview messages (Cursor AI chat might use webviews)
        // Note: This event doesn't exist in VS Code API, so we'll use a different approach
        // vscode.window.onDidChangeWebviewPanelViewState(() => {
        //     this.detectChatContext();
        // });
    }

    private detectChatContext(): void {
        // Try to detect if we're in a Cursor AI chat context
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            
            // Check if this looks like a chat document
            if (this.isChatDocument(document)) {
                this.currentChatId = `chat_${document.uri.toString()}`;
                console.log(`Detected chat context: ${this.currentChatId}`);
            }
        }
    }

    private isChatDocument(document: vscode.TextDocument): boolean {
        // Heuristic: check if document looks like a chat
        const content = document.getText();
        const lines = content.split('\n');
        
        // Look for chat-like patterns
        const hasUserMessages = lines.some(line => 
            line.includes('User:') || 
            line.includes('You:') || 
            line.includes('@') ||
            line.includes('Assistant:') ||
            line.includes('AI:')
        );
        
        const hasCodeBlocks = content.includes('```');
        const hasTimestamps = /\d{1,2}:\d{2}/.test(content);
        
        return hasUserMessages || (hasCodeBlocks && hasTimestamps);
    }

    // Enable AI-Chatter for the current chat
    enableForCurrentChat(): boolean {
        if (this.currentChatId) {
            this.isEnabled = true;
            
            // Register this chat session with the telegram bot manager
            if (this.telegramBotManager) {
                this.telegramBotManager.enableAIChatterForChat(this.currentChatId);
                console.log(`AI-Chatter enabled for chat: ${this.currentChatId} and registered with bot manager`);
            } else {
                console.log(`AI-Chatter enabled for chat: ${this.currentChatId} but no bot manager available`);
            }
            
            return true;
        }
        return false;
    }

    // Disable AI-Chatter for the current chat
    disableForCurrentChat(): boolean {
        if (this.currentChatId) {
            this.isEnabled = false;
            
            // Unregister this chat session from the telegram bot manager
            if (this.telegramBotManager) {
                this.telegramBotManager.disableAIChatterForChat(this.currentChatId);
                console.log(`AI-Chatter disabled for chat: ${this.currentChatId} and unregistered from bot manager`);
            } else {
                console.log(`AI-Chatter disabled for chat: ${this.currentChatId} but no bot manager available`);
            }
            
            return true;
        }
        return false;
    }

    // Check if AI-Chatter is enabled for current chat
    isEnabledForCurrentChat(): boolean {
        return this.isEnabled && this.currentChatId !== null;
    }

    // Inject a Telegram message into the current chat
    injectMessage(username: string, message: string): boolean {
        if (!this.isEnabledForCurrentChat()) {
            return false;
        }

        try {
            // Try multiple injection methods
            return this.tryInjectViaEditor(username, message) ||
                   this.tryInjectViaWebview(username, message) ||
                   this.tryInjectViaClipboard(username, message);
        } catch (error) {
            console.error('Failed to inject message:', error);
            return false;
        }
    }

    private tryInjectViaEditor(username: string, message: string): boolean {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return false;

        try {
            // Format the message
            const formattedMessage = `[Telegram] @${username}: ${message}`;
            
            // Insert at the end of the document
            const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
            
            // Add newline if needed
            const insertText = lastLine.text.length > 0 ? `\n${formattedMessage}` : formattedMessage;
            
            editor.edit(editBuilder => {
                editBuilder.insert(position, insertText);
            });

            console.log(`Message injected via editor: ${formattedMessage}`);
            return true;
        } catch (error) {
            console.error('Editor injection failed:', error);
            return false;
        }
    }

    private tryInjectViaWebview(username: string, message: string): boolean {
        // Try to find active webview panels (Cursor AI chat might use these)
        const panels = vscode.window.visibleTextEditors.filter(editor => 
            editor.document.uri.scheme === 'vscode-webview'
        );

        if (panels.length > 0) {
            // Found webview, try to inject
            const formattedMessage = `[Telegram] @${username}: ${message}`;
            console.log(`Webview found, attempting injection: ${formattedMessage}`);
            
            // Note: Direct webview injection requires the webview to expose an API
            // This is a placeholder for future implementation
            return false;
        }

        return false;
    }

    private tryInjectViaClipboard(username: string, message: string): boolean {
        // As a fallback, copy the message to clipboard and show instructions
        const formattedMessage = `[Telegram] @${username}: ${message}`;
        
        vscode.env.clipboard.writeText(formattedMessage).then(() => {
            vscode.window.showInformationMessage(
                `Telegram message copied to clipboard: "${formattedMessage}"\nPaste it into your chat manually.`
            );
        });

        return true;
    }

    // Get current chat status
    getCurrentChatStatus(): { chatId: string | null; isEnabled: boolean; hasChat: boolean } {
        return {
            chatId: this.currentChatId,
            isEnabled: this.isEnabled,
            hasChat: this.currentChatId !== null
        };
    }

    // Force refresh chat detection
    refreshChatDetection(): void {
        this.detectChatContext();
    }
}
