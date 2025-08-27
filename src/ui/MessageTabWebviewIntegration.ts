import * as vscode from 'vscode';
import { TelegramBotManager } from '../telegram/TelegramBotManager';

export class MessageTabWebviewIntegration {
    private telegramBotManager: TelegramBotManager;
    private webviewPanel: vscode.WebviewPanel | null = null;
    private isActive: boolean = false;
    private currentMessageTab: string | null = null;

    constructor(telegramBotManager: TelegramBotManager) {
        this.telegramBotManager = telegramBotManager;
        this.setupWebviewDetection();
    }

    private setupWebviewDetection(): void {
        // Note: Webview panel events are handled differently in VS Code
        // We'll use alternative detection methods for now
        // vscode.window.onDidChangeWebviewPanelViewState((event) => {
        //     if (event.webviewPanel.viewType.includes('chat') || 
        //         event.webviewPanel.viewType.includes('message') ||
        //         event.webviewPanel.title.includes('Chat') ||
        //         event.webviewPanel.title.includes('Message')) {
        //         this.attachToWebview(event.webviewPanel);
        //     }
        // });

        // Listen for active editor changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.detectMessageTab();
        });
    }

    private detectMessageTab(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const content = document.getText();
        
        // Check if this looks like a message tab
        if (this.isMessageTabContent(content, document)) {
            this.currentMessageTab = `message_${document.uri.toString()}`;
            this.tryInjectCheckbox();
        }
    }

    private isMessageTabContent(content: string, document: vscode.TextDocument): boolean {
        // Look for message tab specific content
        const hasMessageTabContent = 
            content.includes('Agent') ||
            content.includes('Auto') ||
            content.includes('1 Tab') ||
            content.includes('@') ||
            content.includes('⌘I') ||
            content.includes('∞') ||
            content.includes('User:') ||
            content.includes('Assistant:') ||
            content.includes('AI:') ||
            document.fileName.toLowerCase().includes('chat') ||
            document.fileName.toLowerCase().includes('message');

        return hasMessageTabContent;
    }

    private attachToWebview(webviewPanel: vscode.WebviewPanel): void {
        this.webviewPanel = webviewPanel;
        this.currentMessageTab = `webview_${webviewPanel.viewType}`;
        
        // Listen for messages from the webview
        webviewPanel.webview.onDidReceiveMessage((message) => {
            this.handleWebviewMessage(message);
        });

        // Try to inject our checkbox
        this.tryInjectCheckbox();
    }

    private tryInjectCheckbox(): void {
        if (!this.webviewPanel) return;

        try {
            // Inject JavaScript to add the AI-Chatter checkbox
            const script = this.getInjectionScript();
            this.webviewPanel.webview.postMessage({
                command: 'injectAIChatter',
                script: script,
                enabled: this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab || '')
            });
        } catch (error) {
            console.error('Failed to inject AI-Chatter checkbox:', error);
        }
    }

    private getInjectionScript(): string {
        return `
            (function() {
                // Check if AI-Chatter checkbox already exists
                if (document.getElementById('ai-chatter-checkbox')) {
                    return;
                }

                // Look for Agent and Auto buttons
                let agentButton = document.querySelector('[title*="Agent"], button:contains("Agent"), [class*="agent"]');
                let autoButton = document.querySelector('[title*="Auto"], button:contains("Auto"), [class*="auto"]');
                
                if (!agentButton && !autoButton) {
                    // Try alternative selectors
                    const buttons = document.querySelectorAll('button, [role="button"], .btn, [class*="button"]');
                    for (const btn of buttons) {
                        if (btn.textContent.includes('Agent') || btn.textContent.includes('Auto')) {
                            if (!agentButton) agentButton = btn;
                            else if (!autoButton) autoButton = btn;
                        }
                    }
                }

                // Create AI-Chatter checkbox
                const aiChatterCheckbox = document.createElement('div');
                aiChatterCheckbox.id = 'ai-chatter-checkbox';
                aiChatterCheckbox.style.cssText = \`
                    display: inline-flex;
                    align-items: center;
                    margin: 0 8px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    border: 1px solid #ccc;
                    background: #2d2d30;
                    color: #cccccc;
                \`;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'ai-chatter-toggle';
                checkbox.style.cssText = \`
                    margin-right: 6px;
                    cursor: pointer;
                \`;

                const label = document.createElement('span');
                label.textContent = 'AI-Chatter';
                label.style.cssText = \`
                    cursor: pointer;
                    user-select: none;
                \`;

                aiChatterCheckbox.appendChild(checkbox);
                aiChatterCheckbox.appendChild(label);

                // Position the checkbox
                if (autoButton && autoButton.parentNode) {
                    // Insert after Auto button
                    autoButton.parentNode.insertBefore(aiChatterCheckbox, autoButton.nextSibling);
                } else if (agentButton && agentButton.parentNode) {
                    // Insert after Agent button
                    agentButton.parentNode.insertBefore(aiChatterCheckbox, agentButton.nextSibling);
                } else {
                    // Try to find a container and append
                    const container = document.querySelector('.chat-controls, .message-controls, .toolbar, [class*="control"], [class*="toolbar"]');
                    if (container) {
                        container.appendChild(aiChatterCheckbox);
                    }
                }

                // Add event listeners
                checkbox.addEventListener('change', function() {
                    const isEnabled = this.checked;
                    
                    // Update visual state
                    if (isEnabled) {
                        aiChatterCheckbox.style.background = '#007acc';
                        aiChatterCheckbox.style.borderColor = '#007acc';
                        aiChatterCheckbox.style.color = '#ffffff';
                    } else {
                        aiChatterCheckbox.style.background = '#2d2d30';
                        aiChatterCheckbox.style.borderColor = '#ccc';
                        aiChatterCheckbox.style.color = '#cccccc';
                    }

                    // Send message to VS Code extension
                    if (window.vscode) {
                        window.vscode.postMessage({
                            command: 'aiChatterToggle',
                            enabled: isEnabled
                        });
                    }
                });

                // Set initial state
                const isEnabled = ${this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab || '')};
                checkbox.checked = isEnabled;
                if (isEnabled) {
                    aiChatterCheckbox.style.background = '#007acc';
                    aiChatterCheckbox.style.borderColor = '#007acc';
                    aiChatterCheckbox.style.color = '#ffffff';
                }

                console.log('AI-Chatter checkbox injected successfully');
            })();
        `;
    }

    private handleWebviewMessage(message: any): void {
        if (message.command === 'aiChatterToggle') {
            if (this.currentMessageTab) {
                if (message.enabled) {
                    this.telegramBotManager.enableAIChatterForChat(this.currentMessageTab);
                    vscode.window.showInformationMessage('AI-Chatter enabled for this message tab');
                } else {
                    this.telegramBotManager.disableAIChatterForChat(this.currentMessageTab);
                    vscode.window.showInformationMessage('AI-Chatter disabled for this message tab');
                }
            }
        }
    }

    // Get current status
    getStatus(): { isActive: boolean; tabId: string | null; isEnabled: boolean } {
        return {
            isActive: this.isActive,
            tabId: this.currentMessageTab,
            isEnabled: this.currentMessageTab ? this.telegramBotManager.isAIChatterEnabledForChat(this.currentMessageTab) : false
        };
    }

    // Refresh the integration
    refresh(): void {
        this.detectMessageTab();
        if (this.webviewPanel) {
            this.tryInjectCheckbox();
        }
    }

    // Dispose resources
    dispose(): void {
        if (this.webviewPanel) {
            this.webviewPanel.dispose();
        }
    }
}
