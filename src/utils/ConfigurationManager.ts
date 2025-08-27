import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface TelegramConfig {
    botToken: string;
    authorizedUsers: string[];
    maxUsers: number;
}

export class ConfigurationManager {
    private readonly configSection = 'ai-chatter.telegram';
    private readonly yamlConfigPath = '.vscode/ai-chatter.yml';

    getConfiguration(): TelegramConfig {
        const config = vscode.workspace.getConfiguration(this.configSection);
        
        return {
            botToken: config.get('botToken') || '',
            authorizedUsers: config.get('authorizedUsers') || [],
            maxUsers: config.get('maxUsers') || 10
        };
    }

    async updateConfiguration(updates: Partial<TelegramConfig>): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        
        if (updates.botToken !== undefined) {
            await config.update('botToken', updates.botToken, vscode.ConfigurationTarget.Global);
        }
        
        if (updates.authorizedUsers !== undefined) {
            await config.update('authorizedUsers', updates.authorizedUsers, vscode.ConfigurationTarget.Global);
        }
        
        if (updates.maxUsers !== undefined) {
            await config.update('maxUsers', updates.maxUsers, vscode.ConfigurationTarget.Global);
        }
    }

    async addAuthorizedUser(username: string): Promise<boolean> {
        const config = this.getConfiguration();
        
        if (config.authorizedUsers.includes(username)) {
            return false; // User already exists
        }
        
        if (config.authorizedUsers.length >= config.maxUsers) {
            throw new Error(`Maximum number of users (${config.maxUsers}) reached`);
        }
        
        const newUsers = [...config.authorizedUsers, username];
        await this.updateConfiguration({ authorizedUsers: newUsers });
        return true;
    }

    async removeAuthorizedUser(username: string): Promise<boolean> {
        const config = this.getConfiguration();
        const newUsers = config.authorizedUsers.filter(user => user !== username);
        
        if (newUsers.length === config.authorizedUsers.length) {
            return false; // User not found
        }
        
        await this.updateConfiguration({ authorizedUsers: newUsers });
        return true;
    }

    hasValidConfiguration(): boolean {
        const config = this.getConfiguration();
        return config.botToken.length > 0 && config.authorizedUsers.length > 0;
    }

    async loadFromYaml(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return;
        }

        const yamlPath = path.join(workspaceFolders[0].uri.fsPath, this.yamlConfigPath);
        
        try {
            if (fs.existsSync(yamlPath)) {
                const yamlContent = fs.readFileSync(yamlPath, 'utf8');
                const yamlConfig = yaml.load(yamlContent) as any;
                
                if (yamlConfig.telegram) {
                    const telegramConfig = yamlConfig.telegram;
                    await this.updateConfiguration({
                        botToken: telegramConfig.bot_token || '',
                        authorizedUsers: telegramConfig.authorized_users || [],
                        maxUsers: telegramConfig.max_users || 10
                    });
                }
            }
        } catch (error) {
            console.error('Error loading YAML configuration:', error);
            vscode.window.showWarningMessage('Failed to load YAML configuration');
        }
    }

    async saveToYaml(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return;
        }

        const config = this.getConfiguration();
        const yamlPath = path.join(workspaceFolders[0].uri.fsPath, this.yamlConfigPath);
        const yamlDir = path.dirname(yamlPath);
        
        try {
            // Ensure directory exists
            if (!fs.existsSync(yamlDir)) {
                fs.mkdirSync(yamlDir, { recursive: true });
            }
            
            const yamlConfig = {
                telegram: {
                    bot_token: config.botToken,
                    authorized_users: config.authorizedUsers,
                    max_users: config.maxUsers
                }
            };
            
            const yamlContent = yaml.dump(yamlConfig, { indent: 2 });
            fs.writeFileSync(yamlPath, yamlContent, 'utf8');
        } catch (error) {
            console.error('Error saving YAML configuration:', error);
            vscode.window.showErrorMessage('Failed to save YAML configuration');
        }
    }

    validateConfiguration(): { isValid: boolean; errors: string[] } {
        const config = this.getConfiguration();
        const errors: string[] = [];
        
        if (!config.botToken || config.botToken.trim().length === 0) {
            errors.push('Bot token is required');
        }
        
        if (config.authorizedUsers.length === 0) {
            errors.push('At least one authorized user is required');
        }
        
        if (config.authorizedUsers.length > config.maxUsers) {
            errors.push(`Number of authorized users (${config.authorizedUsers.length}) exceeds maximum (${config.maxUsers})`);
        }
        
        // Validate usernames (basic validation)
        for (const username of config.authorizedUsers) {
            if (!username || username.trim().length === 0) {
                errors.push('Username cannot be empty');
            } else if (username.length > 32) {
                errors.push(`Username "${username}" is too long (max 32 characters)`);
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                errors.push(`Username "${username}" contains invalid characters`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
