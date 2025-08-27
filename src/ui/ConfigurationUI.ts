import * as vscode from 'vscode';
import { ConfigurationManager, TelegramConfig } from '../utils/ConfigurationManager';

export class ConfigurationUI {
    private configurationManager: ConfigurationManager;

    constructor(configurationManager: ConfigurationManager) {
        this.configurationManager = configurationManager;
    }

    async showConfiguration(): Promise<void> {
        const config = this.configurationManager.getConfiguration();
        
        // Create configuration panel
        const panel = vscode.window.createWebviewPanel(
            'aiChatterConfig',
            'AI Chatter Configuration',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        // Set HTML content
        panel.webview.html = this.getWebviewContent(config);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'updateConfig':
                        await this.handleConfigUpdate(message.config);
                        break;
                    case 'addUser':
                        await this.handleAddUser(message.username);
                        break;
                    case 'removeUser':
                        await this.handleRemoveUser(message.username);
                        break;
                    case 'saveToYaml':
                        await this.configurationManager.saveToYaml();
                        vscode.window.showInformationMessage('Configuration saved to YAML file');
                        break;
                    case 'loadFromYaml':
                        await this.configurationManager.loadFromYaml();
                        vscode.window.showInformationMessage('Configuration loaded from YAML file');
                        // Refresh the webview
                        panel.webview.postMessage({ command: 'refreshConfig', config: this.configurationManager.getConfiguration() });
                        break;
                    case 'sendTestMessage':
                        await this.handleSendTestMessage(message.message, panel.webview);
                        break;
                    case 'restartTelegramBot':
                        await this.handleRestartTelegramBot(panel.webview);
                        break;
                }
            }
        );
    }

    private async handleConfigUpdate(newConfig: Partial<TelegramConfig>): Promise<void> {
        try {
            await this.configurationManager.updateConfiguration(newConfig);
            vscode.window.showInformationMessage('Configuration updated successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update configuration: ${error}`);
        }
    }

    private async handleAddUser(username: string): Promise<void> {
        try {
            const added = await this.configurationManager.addAuthorizedUser(username);
            if (added) {
                vscode.window.showInformationMessage(`User @${username} added successfully`);
            } else {
                vscode.window.showWarningMessage(`User @${username} already exists`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add user: ${error}`);
        }
    }

    private async handleRemoveUser(username: string): Promise<void> {
        try {
            const removed = await this.configurationManager.removeAuthorizedUser(username);
            if (removed) {
                vscode.window.showInformationMessage(`User @${username} removed successfully`);
            } else {
                vscode.window.showWarningMessage(`User @${username} not found`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to remove user: ${error}`);
        }
    }

    private getWebviewContent(config: TelegramConfig): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Chatter Configuration</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 20px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .section {
                        margin-bottom: 30px;
                        padding: 20px;
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 6px;
                        background-color: var(--vscode-editor-background);
                    }
                    .section h3 {
                        margin-top: 0;
                        color: var(--vscode-editor-foreground);
                        border-bottom: 2px solid var(--vscode-focusBorder);
                        padding-bottom: 10px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: 600;
                        color: var(--vscode-editor-foreground);
                    }
                    input[type="text"], input[type="number"] {
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 4px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        font-size: 14px;
                    }
                    input[type="text"]:focus, input[type="number"]:focus {
                        outline: none;
                        border-color: var(--vscode-focusBorder);
                    }
                    .button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-right: 10px;
                        margin-bottom: 10px;
                    }
                    .button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    .button.secondary {
                        background-color: var(--vscode-button-secondaryBackground);
                        color: var(--vscode-button-secondaryForeground);
                    }
                    .button.secondary:hover {
                        background-color: var(--vscode-button-secondaryHoverBackground);
                    }
                    .button.danger {
                        background-color: var(--vscode-errorForeground);
                        color: white;
                    }
                    .button.danger:hover {
                        background-color: #d73a49;
                    }
                    .user-list {
                        margin-top: 15px;
                    }
                    .user-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background-color: var(--vscode-list-hoverBackground);
                        border-radius: 4px;
                        margin-bottom: 8px;
                    }
                    .user-username {
                        font-weight: 500;
                        color: var(--vscode-editor-foreground);
                    }
                    .status {
                        padding: 10px;
                        border-radius: 4px;
                        margin-bottom: 20px;
                        font-weight: 500;
                    }
                    .status.success {
                        background-color: var(--vscode-notificationsInfoBackground);
                        color: var(--vscode-notificationsInfoForeground);
                        border: 1px solid var(--vscode-notificationsInfoBorder);
                    }
                    .status.warning {
                        background-color: var(--vscode-notificationsWarningBackground);
                        color: var(--vscode-notificationsWarningForeground);
                        border: 1px solid var(--vscode-notificationsWarningBorder);
                    }
                    .status.error {
                        background-color: var(--vscode-notificationsErrorBackground);
                        color: var(--vscode-notificationsErrorForeground);
                        border: 1px solid var(--vscode-notificationsErrorBorder);
                    }
                    .help-text {
                        font-size: 12px;
                        color: var(--vscode-descriptionForeground);
                        margin-top: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🤖 AI Chatter Configuration</h2>
                    
                    <div id="status" class="status ${this.getStatusClass(config)}">
                        ${this.getStatusMessage(config)}
                    </div>

                    <div class="section">
                        <h3>🔑 Bot Configuration</h3>
                        <div class="form-group">
                            <label for="botToken">Telegram Bot Token</label>
                            <input type="text" id="botToken" value="${config.botToken}" placeholder="Enter your bot token from @BotFather">
                            <div class="help-text">Get your bot token by messaging @BotFather on Telegram</div>
                        </div>
                        <button class="button" onclick="updateBotToken()">Update Bot Token</button>
                    </div>

                    <div class="section">
                        <h3>👥 User Management</h3>
                        <div class="form-group">
                            <label for="maxUsers">Maximum Users</label>
                            <input type="number" id="maxUsers" value="${config.maxUsers}" min="1" max="10">
                            <div class="help-text">Maximum number of authorized users (1-10)</div>
                        </div>
                        <button class="button" onclick="updateMaxUsers()">Update Max Users</button>
                    </div>

                    <div class="section">
                        <h3>➕ Add Authorized User</h3>
                        <div class="form-group">
                            <label for="newUsername">Username</label>
                            <input type="text" id="newUsername" placeholder="Enter Telegram username (without @)">
                            <div class="help-text">Enter the username without the @ symbol</div>
                        </div>
                        <button class="button" onclick="addUser()">Add User</button>
                    </div>

                    <div class="section">
                        <h3>📋 Authorized Users (${config.authorizedUsers.length}/${config.maxUsers})</h3>
                        <div id="userList" class="user-list">
                            ${this.renderUserList(config.authorizedUsers)}
                        </div>
                    </div>

                    <div class="section">
                        <h3>🔄 Bot Management</h3>
                        <div class="form-group">
                            <button class="button" onclick="restartTelegramBot()" style="background-color: var(--vscode-button-prominentBackground); color: var(--vscode-button-prominentForeground);">
                                🔄 Restart Telegram Bot
                            </button>
                            <span id="restartStatus" class="status-indicator" style="margin-left: 10px; padding: 5px 10px; border-radius: 4px; font-size: 12px;"></span>
                        </div>
                        <div class="help-text">
                            <p><strong>💡 What this does:</strong></p>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>Stops the current Telegram bot instance</li>
                                <li>Reloads all configuration and settings</li>
                                <li>Restarts the bot with fresh state</li>
                                <li>Useful for troubleshooting and applying changes</li>
                            </ul>
                        </div>
                    </div>

                    <div class="section">
                        <h3>💬 AI Chatter Message Testing</h3>
                        <div class="form-group">
                            <label for="testMessage">Send Message to Cursor AI:</label>
                            <textarea id="testMessage" placeholder="Enter your message/prompt to send to Cursor AI chat..." rows="3" style="width: 100%; padding: 8px 12px; border: 1px solid var(--vscode-input-border); border-radius: 4px; background-color: var(--vscode-input-background); color: var(--vscode-input-foreground); font-size: 14px; resize: vertical;"></textarea>
                            <div class="help-text">Type your message and click Send to test message flow to Cursor AI</div>
                        </div>
                        <div class="form-group">
                            <button class="button" onclick="sendTestMessage()">
                                📤 Send to Cursor AI
                            </button>
                            <span id="sendStatus" class="status-indicator" style="margin-left: 10px; padding: 5px 10px; border-radius: 4px; font-size: 12px;"></span>
                        </div>
                        <div class="help-text">
                            <p><strong>💡 How it works:</strong></p>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>Type your message in the input field above</li>
                                <li>Click "Send to Cursor AI" button</li>
                                <li>Message will appear in the active Cursor AI chat tab</li>
                                <li>Perfect for testing prompts and message flow</li>
                            </ul>
                        </div>
                    </div>

                    <div class="section">
                        <h3>💾 Configuration Files</h3>
                        <button class="button secondary" onclick="saveToYaml()">Save to YAML</button>
                        <button class="button secondary" onclick="loadFromYaml()">Load from YAML</button>
                        <div class="help-text">YAML file will be saved to .vscode/ai-chatter.yml in your workspace</div>
                    </div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function updateBotToken() {
                        const token = document.getElementById('botToken').value;
                        vscode.postMessage({
                            command: 'updateConfig',
                            config: { botToken: token }
                        });
                    }

                    function updateMaxUsers() {
                        const maxUsers = parseInt(document.getElementById('maxUsers').value);
                        vscode.postMessage({
                            command: 'updateConfig',
                            config: { maxUsers: maxUsers }
                        });
                    }

                    function addUser() {
                        const username = document.getElementById('newUsername').value.trim();
                        if (username) {
                            vscode.postMessage({
                                command: 'addUser',
                                username: username
                            });
                            document.getElementById('newUsername').value = '';
                        }
                    }

                    function removeUser(username) {
                        vscode.postMessage({
                            command: 'removeUser',
                            username: username
                        });
                    }

                    function saveToYaml() {
                        vscode.postMessage({
                            command: 'saveToYaml'
                        });
                    }

                    function loadFromYaml() {
                        vscode.postMessage({
                            command: 'loadFromYaml'
                        });
                    }

                    function restartTelegramBot() {
                        const statusElement = document.getElementById('restartStatus');
                        
                        // Show restarting status
                        statusElement.textContent = '🔄 Restarting...';
                        statusElement.style.backgroundColor = 'var(--vscode-notificationsInfoBackground)';
                        statusElement.style.color = 'var(--vscode-notificationsInfoForeground)';
                        
                        vscode.postMessage({
                            command: 'restartTelegramBot'
                        });
                    }

                    function sendTestMessage() {
                        const message = document.getElementById('testMessage').value.trim();
                        const statusElement = document.getElementById('sendStatus');
                        
                        if (!message) {
                            statusElement.textContent = '❌ Please enter a message';
                            statusElement.style.backgroundColor = 'var(--vscode-errorForeground)';
                            statusElement.style.color = 'white';
                            return;
                        }
                        
                        // Show sending status
                        statusElement.textContent = '📤 Sending...';
                        statusElement.style.backgroundColor = 'var(--vscode-notificationsInfoBackground)';
                        statusElement.style.color = 'var(--vscode-notificationsInfoForeground)';
                        
                        vscode.postMessage({
                            command: 'sendTestMessage',
                            message: message
                        });
                    }

                    // Handle Enter key in input fields
                    document.getElementById('newUsername').addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            addUser();
                        }
                    });

                    // Handle Enter key in test message textarea (Ctrl+Enter to send)
                    document.getElementById('testMessage').addEventListener('keydown', function(e) {
                        if (e.ctrlKey && e.key === 'Enter') {
                            sendTestMessage();
                        }
                    });

                    // Listen for messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'refreshConfig':
                                // Refresh the page to show updated config
                                location.reload();
                                break;
                            case 'updateSendStatus':
                                const statusElement = document.getElementById('sendStatus');
                                statusElement.textContent = message.status;
                                if (message.isError) {
                                    statusElement.style.backgroundColor = 'var(--vscode-errorForeground)';
                                    statusElement.style.color = 'white';
                                } else {
                                    statusElement.style.backgroundColor = 'var(--vscode-notificationsInfoBackground)';
                                    statusElement.style.color = 'var(--vscode-notificationsInfoForeground)';
                                }
                                // Clear status after 5 seconds
                                setTimeout(() => {
                                    statusElement.textContent = '';
                                    statusElement.style.backgroundColor = '';
                                    statusElement.style.color = '';
                                }, 5000);
                                break;
                            case 'updateRestartStatus':
                                const restartStatusElement = document.getElementById('restartStatus');
                                restartStatusElement.textContent = message.status;
                                if (message.isError) {
                                    restartStatusElement.style.backgroundColor = 'var(--vscode-errorForeground)';
                                    restartStatusElement.style.color = 'white';
                                } else {
                                    restartStatusElement.style.backgroundColor = 'var(--vscode-notificationsInfoBackground)';
                                    restartStatusElement.style.color = 'var(--vscode-notificationsInfoForeground)';
                                }
                                // Clear status after 8 seconds (longer for restart operations)
                                setTimeout(() => {
                                    restartStatusElement.textContent = '';
                                    restartStatusElement.style.backgroundColor = '';
                                    restartStatusElement.style.color = '';
                                }, 8000);
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }

    private getStatusClass(config: TelegramConfig): string {
        const validation = this.configurationManager.validateConfiguration();
        if (validation.isValid) {
            return 'success';
        } else if (config.botToken && config.authorizedUsers.length > 0) {
            return 'warning';
        } else {
            return 'error';
        }
    }

    private getStatusMessage(config: TelegramConfig): string {
        const validation = this.configurationManager.validateConfiguration();
        if (validation.isValid) {
            return '✅ Configuration is valid and ready to use!';
        } else if (validation.errors.length > 0) {
            return `⚠️ Configuration issues: ${validation.errors.join(', ')}`;
        } else {
            return '❌ Please configure bot token and add authorized users';
        }
    }

    private renderUserList(users: string[]): string {
        if (users.length === 0) {
            return '<p style="color: var(--vscode-descriptionField);">No authorized users yet. Add users above to get started.</p>';
        }

        return users.map(username => `
            <div class="user-item">
                <span class="user-username">@${username}</span>
                <button class="button danger" onclick="removeUser('${username}')">Remove</button>
            </div>
        `).join('');
    }

    private async handleSendTestMessage(message: string, webview: vscode.Webview): Promise<void> {
        try {
            // Get the active editor
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                webview.postMessage({ 
                    command: 'updateSendStatus', 
                    status: '❌ No active editor found. Please open a Cursor AI chat tab.',
                    isError: true
                });
                return;
            }

            // Check if this is a Cursor AI chat tab
            const document = activeEditor.document;
            const isCursorAIChat = this.isCursorAIChatTab(document);
            
            if (!isCursorAIChat) {
                webview.postMessage({ 
                    command: 'updateSendStatus', 
                    status: '❌ Active tab is not a Cursor AI chat. Please open a Cursor AI chat tab.',
                    isError: true
                });
                return;
            }

            // Insert the message into the active editor
            const position = activeEditor.selection.active;
            const messageText = `\n\n**Test Message from AI Chatter Configuration:**\n${message}\n\n`;
            
            await activeEditor.edit(editBuilder => {
                editBuilder.insert(position, messageText);
            });

            // Show success message
            webview.postMessage({ 
                command: 'updateSendStatus', 
                status: '✅ Message sent to Cursor AI chat!',
                isError: false
            });

            // Also show notification
            vscode.window.showInformationMessage(`Test message sent to Cursor AI: "${message}"`);

        } catch (error) {
            console.error('Error sending test message:', error);
            webview.postMessage({ 
                command: 'updateSendStatus', 
                status: `❌ Error: ${error}`,
                isError: true
            });
        }
    }

    private isCursorAIChatTab(document: vscode.TextDocument): boolean {
        // Check if this looks like a Cursor AI chat tab
        const content = document.getText();
        const fileName = document.fileName.toLowerCase();
        
        // Check for common Cursor AI patterns
        const hasCursorAIPatterns = 
            content.includes('User:') || 
            content.includes('Assistant:') || 
            content.includes('Cursor AI') ||
            content.includes('AI Chat') ||
            content.includes('Chat History');
        
        // Check if file name suggests it's a chat
        const isChatFile = 
            fileName.includes('chat') || 
            fileName.includes('ai') || 
            fileName.includes('conversation') ||
            fileName.includes('cursor');
        
        return hasCursorAIPatterns || isChatFile;
    }

    private async handleRestartTelegramBot(webview: vscode.Webview): Promise<void> {
        try {
            // Show restarting notification
            vscode.window.showInformationMessage('🔄 Restarting Telegram Bot...');
            
            // Send restart command to the extension
            await vscode.commands.executeCommand('ai-chatter.restartBot');
            
            // Update webview status
            webview.postMessage({ 
                command: 'updateRestartStatus', 
                status: '✅ Bot restarted successfully!',
                isError: false
            });
            
            // Show success notification
            vscode.window.showInformationMessage('✅ Telegram Bot restarted successfully!');
            
        } catch (error) {
            console.error('Error restarting Telegram bot:', error);
            
            // Update webview status with error
            webview.postMessage({ 
                command: 'updateRestartStatus', 
                status: `❌ Error restarting bot: ${error}`,
                isError: true
            });
            
            // Show error notification
            vscode.window.showErrorMessage(`Failed to restart Telegram bot: ${error}`);
        }
    }
}
