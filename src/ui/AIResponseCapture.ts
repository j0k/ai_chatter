import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';

export interface AIResponse {
    content: string;
    timestamp: number;
    chatId: string;
    isComplete: boolean;
}

export class AIResponseCapture {
    private telegramBotManager: TelegramBotManager;
    private isMonitoring: boolean = false;
    private currentResponse: AIResponse | null = null;
    private responseTimeout: NodeJS.Timeout | null = null;
    private lastContentLength: number = 0;
    private static readonly RESPONSE_TIMEOUT = 5000; // 5 seconds to detect response completion

    constructor(telegramBotManager: TelegramBotManager) {
        this.telegramBotManager = telegramBotManager;
        this.setupMonitoring();
    }

    private setupMonitoring(): void {
        // Monitor document changes to detect AI responses
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (this.isMonitoring) {
                this.handleDocumentChange(event);
            }
        });

        // Monitor active editor changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.checkForAIResponse();
        });

        // Start monitoring when extension activates
        this.startMonitoring();
    }

    private startMonitoring(): void {
        this.isMonitoring = true;
        console.log('AI Response Capture: Monitoring started');
    }

    private stopMonitoring(): void {
        this.isMonitoring = false;
        console.log('AI Response Capture: Monitoring stopped');
    }

    private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const document = event.document;
        const content = document.getText();
        
        // Check if this looks like an AI response
        if (this.isAIResponseContent(content, document)) {
            this.processAIResponse(content, document);
        }
    }

    private isAIResponseContent(content: string, document: vscode.TextDocument): boolean {
        // Look for AI response patterns
        const hasAIResponsePatterns = 
            content.includes('Assistant:') ||
            content.includes('AI:') ||
            content.includes('🤖') ||
            content.includes('```') ||
            content.includes('Here\'s') ||
            content.includes('I can help') ||
            content.includes('Let me') ||
            content.includes('Based on');

        // Check if content has grown (indicating AI is typing)
        const hasContentGrowth = content.length > this.lastContentLength;
        
        // Check if this is a chat document
        const isChatDocument = this.isChatDocument(document);

        return hasAIResponsePatterns && hasContentGrowth && isChatDocument;
    }

    private isChatDocument(document: vscode.TextDocument): boolean {
        const content = document.getText();
        const fileName = document.fileName.toLowerCase();
        
        return fileName.includes('chat') ||
               fileName.includes('message') ||
               content.includes('User:') ||
               content.includes('Assistant:') ||
               content.includes('AI:') ||
               content.includes('@username') ||
               document.uri.scheme === 'vscode-webview';
    }

    private processAIResponse(content: string, document: vscode.TextDocument): void {
        const chatId = `chat_${document.uri.toString()}`;
        
        // Check if this chat has AI-Chatter enabled
        if (!this.telegramBotManager.isAIChatterEnabledForChat(chatId)) {
            return;
        }

        // Extract the AI response part
        const aiResponse = this.extractAIResponse(content);
        if (!aiResponse) {
            return;
        }

        // Update current response
        this.currentResponse = {
            content: aiResponse,
            timestamp: Date.now(),
            chatId: chatId,
            isComplete: false
        };

        // Reset timeout for response completion
        this.resetResponseTimeout();
        
        // Update content length for next comparison
        this.lastContentLength = content.length;
    }

    private extractAIResponse(content: string): string | null {
        // Look for the latest AI response in the content
        const lines = content.split('\n');
        let aiResponseLines: string[] = [];
        let inAIResponse = false;
        let foundResponse = false;

        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            
            // Look for AI response markers
            if (line.startsWith('Assistant:') || line.startsWith('AI:') || line.startsWith('🤖')) {
                inAIResponse = true;
                foundResponse = true;
                aiResponseLines.unshift(line);
                continue;
            }

            // If we're in an AI response, collect lines
            if (inAIResponse) {
                // Stop if we hit a user message or empty line
                if (line.startsWith('User:') || line.startsWith('@') || line === '') {
                    break;
                }
                aiResponseLines.unshift(line);
            }
        }

        if (!foundResponse || aiResponseLines.length === 0) {
            return null;
        }

        return aiResponseLines.join('\n').trim();
    }

    private resetResponseTimeout(): void {
        // Clear existing timeout
        if (this.responseTimeout) {
            clearTimeout(this.responseTimeout);
        }

        // Set new timeout to detect when response is complete
        this.responseTimeout = setTimeout(() => {
            this.completeResponse();
        }, AIResponseCapture.RESPONSE_TIMEOUT);
    }

    private async completeResponse(): Promise<void> {
        if (!this.currentResponse) {
            return;
        }

        // Mark response as complete
        this.currentResponse.isComplete = true;

        // Send response to Telegram
        const success = await this.telegramBotManager.sendAIResponseToTelegram(
            this.currentResponse.content,
            this.currentResponse.chatId
        );

        if (success) {
            console.log(`AI Response captured and sent to Telegram: ${this.currentResponse.content.substring(0, 100)}...`);
        } else {
            console.log('Failed to send AI response to Telegram');
        }

        // Reset current response
        this.currentResponse = null;
        this.lastContentLength = 0;
    }

    // Manual trigger to send current response
    async sendCurrentResponse(): Promise<boolean> {
        if (!this.currentResponse) {
            return false;
        }

        return await this.telegramBotManager.sendAIResponseToTelegram(
            this.currentResponse.content,
            this.currentResponse.chatId
        );
    }

    // Get current response status
    getCurrentResponseStatus(): { hasResponse: boolean; isComplete: boolean; content: string } {
        if (!this.currentResponse) {
            return { hasResponse: false, isComplete: false, content: '' };
        }

        return {
            hasResponse: true,
            isComplete: this.currentResponse.isComplete,
            content: this.currentResponse.content
        };
    }

    // Force refresh monitoring
    refresh(): void {
        this.checkForAIResponse();
    }

    private checkForAIResponse(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const content = editor.document.getText();
            if (this.isAIResponseContent(content, editor.document)) {
                this.processAIResponse(content, editor.document);
            }
        }
    }

    // Dispose resources
    dispose(): void {
        this.stopMonitoring();
        if (this.responseTimeout) {
            clearTimeout(this.responseTimeout);
        }
    }
}
