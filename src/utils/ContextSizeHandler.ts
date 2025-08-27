import * as vscode from 'vscode';

export interface ContextSizeInfo {
    size: number;
    unit: string;
    percentage: number;
    isAvailable: boolean;
    source: string;
    timestamp: number;
}

export class ContextSizeHandler {
    private isMonitoring: boolean = false;
    private lastContextSize: ContextSizeInfo | null = null;

    constructor() {
        this.setupMonitoring();
    }

    private setupMonitoring(): void {
        // Monitor active editor changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.detectContextSize();
        });

        // Monitor document changes
        vscode.workspace.onDidChangeTextDocument(() => {
            this.detectContextSize();
        });

        // Start monitoring when extension activates
        this.startMonitoring();
    }

    private startMonitoring(): void {
        this.isMonitoring = true;
        console.log('Context Size Handler: Monitoring started');
    }

    private stopMonitoring(): void {
        this.isMonitoring = false;
        console.log('Context Size Handler: Monitoring stopped');
    }

    private detectContextSize(): void {
        if (!this.isMonitoring) return;

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const content = document.getText();
        
        // Try to detect context size from various sources
        const contextSize = this.extractContextSize(content, document);
        if (contextSize.isAvailable) {
            this.lastContextSize = contextSize;
            console.log(`Context size detected: ${contextSize.size}${contextSize.unit} (${contextSize.percentage}%)`);
        }
    }

    private extractContextSize(content: string, document: vscode.TextDocument): ContextSizeInfo {
        // Look for context size patterns in the content
        const patterns = [
            // Pattern: "85.4%" or "70.4%" (percentage format)
            /(\d+\.?\d*)%/g,
            // Pattern: "Context: 85.4%" or "Size: 70.4%"
            /(?:context|size|usage)\s*:\s*(\d+\.?\d*)%/gi,
            // Pattern: "85.4% used" or "70.4% full"
            /(\d+\.?\d*)%\s*(?:used|full|occupied|consumed)/gi,
            // Pattern: "Context size: 85.4%"
            /context\s*size\s*:\s*(\d+\.?\d*)%/gi
        ];

        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                // Extract the percentage value
                const percentageMatch = matches[0].match(/(\d+\.?\d*)%/);
                if (percentageMatch) {
                    const percentage = parseFloat(percentageMatch[1]);
                    return {
                        size: percentage,
                        unit: '%',
                        percentage: percentage,
                        isAvailable: true,
                        source: 'content_pattern',
                        timestamp: Date.now()
                    };
                }
            }
        }

        // Look for context size in document metadata or properties
        const documentInfo = this.extractFromDocumentInfo(document);
        if (documentInfo.isAvailable) {
            return documentInfo;
        }

        // Look for context size in webview content
        const webviewInfo = this.extractFromWebviewContent(content);
        if (webviewInfo.isAvailable) {
            return webviewInfo;
        }

        // Default: no context size available
        return {
            size: 0,
            unit: '%',
            percentage: 0,
            isAvailable: false,
            source: 'not_found',
            timestamp: Date.now()
        };
    }

    private extractFromDocumentInfo(document: vscode.TextDocument): ContextSizeInfo {
        // Try to extract context size from document properties
        try {
            // Check if this is a chat document
            if (document.fileName.toLowerCase().includes('chat') ||
                document.fileName.toLowerCase().includes('message') ||
                document.uri.scheme === 'vscode-webview') {
                
                // Look for context size in document metadata
                const content = document.getText();
                
                // Check for specific Cursor AI context indicators
                if (content.includes('@ Add Context') || 
                    content.includes('Agent') || 
                    content.includes('Auto')) {
                    
                    // This looks like a Cursor AI chat interface
                    // Try to find context size in the content
                    const contextMatch = content.match(/(\d+\.?\d*)%/);
                    if (contextMatch) {
                        const percentage = parseFloat(contextMatch[1]);
                        return {
                            size: percentage,
                            unit: '%',
                            percentage: percentage,
                            isAvailable: true,
                            source: 'cursor_ai_interface',
                            timestamp: Date.now()
                        };
                    }
                }
            }
        } catch (error) {
            console.error('Error extracting context size from document info:', error);
        }

        return {
            size: 0,
            unit: '%',
            percentage: 0,
            isAvailable: false,
            source: 'document_info',
            timestamp: Date.now()
        };
    }

    private extractFromWebviewContent(content: string): ContextSizeInfo {
        // Look for context size in webview content
        // This might include HTML-like content or specific markers
        
        // Pattern: Look for percentage values near context-related text
        const contextPatterns = [
            /(\d+\.?\d*)%\s*(?:context|size|usage|full)/gi,
            /(?:context|size|usage)\s*(\d+\.?\d*)%/gi,
            /(\d+\.?\d*)%\s*(?:remaining|available|free)/gi
        ];

        for (const pattern of contextPatterns) {
            const match = content.match(pattern);
            if (match) {
                const percentageMatch = match[0].match(/(\d+\.?\d*)%/);
                if (percentageMatch) {
                    const percentage = parseFloat(percentageMatch[1]);
                    return {
                        size: percentage,
                        unit: '%',
                        percentage: percentage,
                        isAvailable: true,
                        source: 'webview_content',
                        timestamp: Date.now()
                    };
                }
            }
        }

        return {
            size: 0,
            unit: '%',
            percentage: 0,
            isAvailable: false,
            source: 'webview_content',
            timestamp: Date.now()
        };
    }

    // Get current context size
    getCurrentContextSize(): ContextSizeInfo | null {
        return this.lastContextSize;
    }

    // Force refresh context size detection
    refreshContextSize(): void {
        this.detectContextSize();
    }

    // Check if context size is available
    isContextSizeAvailable(): boolean {
        return this.lastContextSize?.isAvailable || false;
    }

    // Get context size as formatted string
    getFormattedContextSize(): string {
        if (!this.lastContextSize || !this.lastContextSize.isAvailable) {
            return 'Context size not available';
        }

        const info = this.lastContextSize;
        return `${info.percentage}%`;
    }

    // Get detailed context size information
    getDetailedContextSize(): string {
        if (!this.lastContextSize || !this.lastContextSize.isAvailable) {
            return 'Context size information not available';
        }

        const info = this.lastContextSize;
        return `Context Size: ${info.percentage}%\nSource: ${info.source}\nDetected: ${new Date(info.timestamp).toLocaleTimeString()}`;
    }

    // Dispose resources
    dispose(): void {
        this.stopMonitoring();
    }
}
