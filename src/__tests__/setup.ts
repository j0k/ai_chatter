// Test setup for AI Chatter v1.2.0
import { jest } from '@jest/globals';

// Mock VS Code API
const mockVscode = {
  window: {
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
    })),
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
  },
  workspace: {
    fs: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      findFiles: jest.fn(),
    },
    getConfiguration: jest.fn(),
  },
  commands: {
    executeCommand: jest.fn(),
    getCommands: jest.fn(),
  },
  env: {
    clipboard: {
      writeText: jest.fn(),
      readText: jest.fn(),
    },
  },
  Uri: {
    file: jest.fn(),
  },
};

// Mock node-telegram-bot-api
const mockTelegramBot = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  sendMessage: jest.fn(),
  sendDocument: jest.fn(),
  stopPolling: jest.fn(),
  isPolling: jest.fn(() => false),
}));

// Global mocks
declare global {
  var vscode: any;
  var TelegramBot: any;
}

global.vscode = mockVscode;
global.TelegramBot = mockTelegramBot;

// Test utilities
export const createMockCommandResult = () => ({
  success: true,
  message: 'Test result',
  data: {},
  error: undefined,
});

export const createMockCommand = () => ({
  name: 'test',
  description: 'Test command',
  usage: '/test',
  examples: ['/test'],
  handler: jest.fn().mockResolvedValue(createMockCommandResult()),
  requiresAuth: false,
  adminOnly: false,
});

export const createMockPlugin = () => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  description: 'A test plugin',
  author: 'Test Author',
  commands: [],
  onActivate: jest.fn(),
  onDeactivate: jest.fn(),
});

// Console mock for cleaner test output
const originalConsole = Object.assign({}, console);
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});
