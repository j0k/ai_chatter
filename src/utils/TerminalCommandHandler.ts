import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

export interface TerminalCommandResult {
    success: boolean;
    output: string;
    error: string;
    exitCode: number;
    command: string;
    executionTime: number;
}

export interface TerminalCommandConfig {
    allowedCommands: string[];
    blockedCommands: string[];
    maxExecutionTime: number;
    workingDirectory: string;
    environment: NodeJS.ProcessEnv;
}

export class TerminalCommandHandler {
    private config: TerminalCommandConfig;
    private isEnabled: boolean = true;

    constructor() {
        this.config = {
            allowedCommands: [
                'ls', 'pwd', 'whoami', 'date', 'uptime', 'df', 'ps',
                'cat', 'head', 'tail', 'grep', 'find', 'du', 'free',
                'git', 'npm', 'node', 'python', 'python3', 'java',
                'docker', 'kubectl', 'aws', 'gcloud'
            ],
            blockedCommands: [
                'rm', 'del', 'format', 'shutdown', 'reboot', 'halt',
                'poweroff', 'init', 'killall', 'pkill', 'kill',
                'sudo', 'su', 'chmod', 'chown', 'chgrp'
            ],
            maxExecutionTime: 30000, // 30 seconds
            workingDirectory: process.cwd(),
            environment: process.env
        };
    }

    // Execute a terminal command
    async executeCommand(command: string, username: string): Promise<TerminalCommandResult> {
        if (!this.isEnabled) {
            return {
                success: false,
                output: '',
                error: 'Terminal commands are disabled',
                exitCode: -1,
                command: command,
                executionTime: 0
            };
        }

        // Validate command
        const validation = this.validateCommand(command);
        if (!validation.isValid) {
            return {
                success: false,
                output: '',
                error: `Command blocked: ${validation.reason}`,
                exitCode: -1,
                command: command,
                executionTime: 0
            };
        }

        const startTime = Date.now();
        
        try {
            // Execute the command
            const result = await this.runCommand(command);
            const executionTime = Date.now() - startTime;

            // Log the execution
            this.logCommandExecution(username, command, result.success, executionTime);

            return {
                success: result.success,
                output: result.output,
                error: result.error,
                exitCode: result.exitCode,
                command: command,
                executionTime: executionTime
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            this.logCommandExecution(username, command, false, executionTime);
            
            return {
                success: false,
                output: '',
                error: `Execution failed: ${error}`,
                exitCode: -1,
                command: command,
                executionTime: executionTime
            };
        }
    }

    // Validate if a command is allowed
    private validateCommand(command: string): { isValid: boolean; reason?: string } {
        // Check for blocked commands
        for (const blocked of this.config.blockedCommands) {
            if (command.includes(blocked)) {
                return { isValid: false, reason: `Blocked command: ${blocked}` };
            }
        }

        // Check for dangerous patterns
        const dangerousPatterns = [
            /[;&|`$]/g,           // Command separators
            />\s*\//g,            // File redirection to root
            /rm\s+-rf/g,          // Recursive force remove
            /sudo\s+/g,           // Sudo commands
            /chmod\s+777/g,       // Dangerous permissions
            /chown\s+root/g       // Ownership changes
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(command)) {
                return { isValid: false, reason: 'Dangerous command pattern detected' };
            }
        }

        // Check if command starts with allowed commands
        const commandParts = command.trim().split(/\s+/);
        const baseCommand = commandParts[0];
        
        if (!this.config.allowedCommands.includes(baseCommand)) {
            return { isValid: false, reason: `Command not in allowed list: ${baseCommand}` };
        }

        return { isValid: true };
    }

    // Run the actual command
    private async runCommand(command: string): Promise<{ success: boolean; output: string; error: string; exitCode: number }> {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({
                    success: false,
                    output: '',
                    error: 'Command execution timed out',
                    exitCode: -1
                });
            }, this.config.maxExecutionTime);

            child_process.exec(command, {
                cwd: this.config.workingDirectory,
                env: this.config.environment,
                timeout: this.config.maxExecutionTime
            }, (error, stdout, stderr) => {
                clearTimeout(timeout);
                
                if (error) {
                    resolve({
                        success: false,
                        output: stdout,
                        error: stderr || error.message,
                        exitCode: error.code || -1
                    });
                } else {
                    resolve({
                        success: true,
                        output: stdout,
                        error: stderr,
                        exitCode: 0
                    });
                }
            });
        });
    }

    // Log command execution for security
    private logCommandExecution(username: string, command: string, success: boolean, executionTime: number): void {
        const logMessage = `[TERMINAL] @${username} executed: ${command} (${success ? 'SUCCESS' : 'FAILED'}) in ${executionTime}ms`;
        
        // Log to VS Code output
        const outputChannel = vscode.window.createOutputChannel('AI Chatter Terminal');
        outputChannel.appendLine(`[${new Date().toISOString()}] ${logMessage}`);
        
        // Also log to console for debugging
        console.log(logMessage);
    }

    // Get current working directory
    getCurrentWorkingDirectory(): string {
        return this.config.workingDirectory;
    }

    // Set working directory
    setWorkingDirectory(dir: string): boolean {
        try {
            const resolvedPath = path.resolve(dir);
            if (require('fs').existsSync(resolvedPath)) {
                this.config.workingDirectory = resolvedPath;
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Enable/disable terminal commands
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    // Check if terminal commands are enabled
    isTerminalEnabled(): boolean {
        return this.isEnabled;
    }

    // Get allowed commands list
    getAllowedCommands(): string[] {
        return [...this.config.allowedCommands];
    }

    // Get blocked commands list
    getBlockedCommands(): string[] {
        return [...this.config.blockedCommands];
    }

    // Add allowed command
    addAllowedCommand(command: string): void {
        if (!this.config.allowedCommands.includes(command)) {
            this.config.allowedCommands.push(command);
        }
    }

    // Remove allowed command
    removeAllowedCommand(command: string): boolean {
        const index = this.config.allowedCommands.indexOf(command);
        if (index > -1) {
            this.config.allowedCommands.splice(index, 1);
            return true;
        }
        return false;
    }

    // Get configuration
    getConfig(): TerminalCommandConfig {
        return { ...this.config };
    }

    // Update configuration
    updateConfig(newConfig: Partial<TerminalCommandConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}
