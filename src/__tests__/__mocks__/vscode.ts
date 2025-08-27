// Mock VS Code API for testing
export const window = {
  createOutputChannel: jest.fn(() => ({
    appendLine: jest.fn(),
    show: jest.fn(),
    dispose: jest.fn(),
  })),
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
};

export const workspace = {
  fs: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    findFiles: jest.fn(),
  },
  getConfiguration: jest.fn(),
};

export const commands = {
  executeCommand: jest.fn(),
  getCommands: jest.fn(),
};

export const env = {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
};

export const Uri = {
  file: jest.fn(),
};

export default {
  window,
  workspace,
  commands,
  env,
  Uri,
};
