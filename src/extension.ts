import * as vscode from 'vscode';
import { TelegramBotManager } from './telegram/TelegramBotManager';
import { ConfigurationManager } from './utils/ConfigurationManager';
import { StatusBarManager } from './ui/StatusBarManager';
import { ConfigurationUI } from './ui/ConfigurationUI';
import { ChatIntegrationUI } from './ui/ChatIntegrationUI';
import { MessageTabIntegration } from './ui/MessageTabIntegration';
import { AIResponseCapture } from './ui/AIResponseCapture';

let telegramBotManager: TelegramBotManager;
let configurationManager: ConfigurationManager;
let statusBarManager: StatusBarManager;
let configurationUI: ConfigurationUI;
let chatIntegrationUI: ChatIntegrationUI;
let messageTabIntegration: MessageTabIntegration;
let aiResponseCapture: AIResponseCapture;

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Chatter extension is now active!');

    // Initialize managers
    configurationManager = new ConfigurationManager();
    telegramBotManager = new TelegramBotManager(configurationManager);
    statusBarManager = new StatusBarManager(telegramBotManager);
    configurationUI = new ConfigurationUI(configurationManager);
    chatIntegrationUI = new ChatIntegrationUI(telegramBotManager);
    messageTabIntegration = new MessageTabIntegration(telegramBotManager);
    aiResponseCapture = new AIResponseCapture(telegramBotManager);

    // Register commands
    const configureCommand = vscode.commands.registerCommand('ai-chatter.configure', () => {
        configurationUI.showConfiguration();
    });

    const startCommand = vscode.commands.registerCommand('ai-chatter.start', async () => {
        try {
            await telegramBotManager.startBot();
            vscode.window.showInformationMessage('AI Chatter bot started successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start bot: ${error}`);
        }
    });

    const stopCommand = vscode.commands.registerCommand('ai-chatter.stop', async () => {
        try {
            await telegramBotManager.stopBot();
            vscode.window.showInformationMessage('AI Chatter bot stopped successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop bot: ${error}`);
        }
    });

    const statusCommand = vscode.commands.registerCommand('ai-chatter.status', () => {
        const status = telegramBotManager.getStatus();
        vscode.window.showInformationMessage(`AI Chatter Status: ${status}`);
    });

    const toggleChatCommand = vscode.commands.registerCommand('ai-chatter.toggleChat', () => {
        chatIntegrationUI.toggleAIChatterForCurrentChat();
    });

    const toggleMessageTabCommand = vscode.commands.registerCommand('ai-chatter.toggleMessageTab', () => {
        messageTabIntegration.toggleForCurrentMessageTab();
    });

    const sendResponseCommand = vscode.commands.registerCommand('ai-chatter.sendResponse', async () => {
        if (aiResponseCapture) {
            const success = await aiResponseCapture.sendCurrentResponse();
            if (success) {
                vscode.window.showInformationMessage('AI response sent to Telegram!');
            } else {
                vscode.window.showWarningMessage('No AI response available or failed to send to Telegram');
            }
        }
    });

    const restartBotCommand = vscode.commands.registerCommand('ai-chatter.restartBot', async () => {
        try {
            // Stop the current bot if running
            if (telegramBotManager) {
                await telegramBotManager.stopBot();
            }
            
            // Wait a moment for cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Start the bot again
            if (telegramBotManager) {
                await telegramBotManager.startBot();
            }
            
            vscode.window.showInformationMessage('✅ Telegram Bot restarted successfully!');
        } catch (error) {
            console.error('Error restarting bot:', error);
            vscode.window.showErrorMessage(`Failed to restart bot: ${error}`);
        }
    });

    // Command to inject DOM manipulation script into webviews
    const injectDOMScriptCommand = vscode.commands.registerCommand('ai-chatter.injectDOMScript', async (args: {searchText: string; addText: string}) => {
        try {
            const { searchText, addText } = args;
            
            // Try to find active webview panels
            const webviewPanels = vscode.window.visibleTextEditors
                .filter(editor => editor.document.uri.scheme === 'webview-panel');
            
            if (webviewPanels.length > 0) {
                console.log(`[AI-CHATTER] Found ${webviewPanels.length} webview panels for DOM manipulation`);
                
                // Try to inject the script into webviews
                for (const editor of webviewPanels) {
                    try {
                        console.log(`[AI-CHATTER] Processing webview: ${editor.document.uri}`);
                        
                        // Try to post message to webview if possible
                        // Note: This requires the webview to be set up to receive messages
                        if (editor.document.uri.scheme === 'webview-panel') {
                            console.log(`[AI-CHATTER] Found webview panel, attempting DOM modification`);
                            
                            // Try to access webview content
                            const document = editor.document;
                            if (document) {
                                const content = document.getText();
                                if (content.includes(searchText)) {
                                    console.log(`[AI-CHATTER] Found "${searchText}" in webview content`);
                                    
                                    // Try to modify the content
                                    const newContent = content.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), searchText + addText);
                                    const edit = new vscode.WorkspaceEdit();
                                    const fullRange = new vscode.Range(
                                        document.positionAt(0),
                                        document.positionAt(content.length)
                                    );
                                    edit.replace(document.uri, fullRange, newContent);
                                    const success = await vscode.workspace.applyEdit(edit);
                                    
                                    if (success) {
                                        console.log(`[AI-CHATTER] Successfully modified webview content`);
                                        vscode.window.showInformationMessage(`✅ Webview modified: "${searchText}" → "${searchText}${addText}"`);
                                    } else {
                                        console.log(`[AI-CHATTER] Failed to apply webview edit`);
                                    }
                                }
                            }
                        }
                    } catch (webviewError) {
                        console.error(`[AI-CHATTER] Error processing webview ${editor.document.uri}:`, webviewError);
                    }
                }
                
                vscode.window.showInformationMessage(`🔍 DOM manipulation attempted for "${searchText}" + "${addText}"`);
            } else {
                vscode.window.showInformationMessage('❌ No webview panels found for DOM manipulation');
            }
        } catch (error) {
            console.error('Error injecting DOM script:', error);
            vscode.window.showErrorMessage(`Failed to inject DOM script: ${error}`);
        }
    });

    // Add commands to context
    context.subscriptions.push(
        configureCommand,
        startCommand,
        stopCommand,
        statusCommand,
        toggleChatCommand,
        toggleMessageTabCommand,
        sendResponseCommand,
        restartBotCommand,
        injectDOMScriptCommand
    );

    // Initialize status bar
    statusBarManager.initialize();
    
    // Initialize chat integration UI
    chatIntegrationUI.initialize();
    
    // Initialize message tab integration
    messageTabIntegration.refreshDetection();

    // Try to start bot if configuration exists
    if (configurationManager.hasValidConfiguration()) {
        telegramBotManager.startBot().catch(error => {
            console.log('Failed to auto-start bot:', error);
        });
    }
}

export function deactivate() {
    if (telegramBotManager) {
        telegramBotManager.stopBot();
    }
    if (statusBarManager) {
        statusBarManager.dispose();
    }
    if (chatIntegrationUI) {
        chatIntegrationUI.dispose();
    }
    if (messageTabIntegration) {
        messageTabIntegration.dispose();
    }
    if (aiResponseCapture) {
        aiResponseCapture.dispose();
    }
}
