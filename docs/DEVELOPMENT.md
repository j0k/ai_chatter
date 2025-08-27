# AI Chatter Development Guide

This guide will help you set up the development environment for the AI Chatter plugin and understand how to contribute to the project.

## 🚀 Development Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **VS Code** or **AI Cursor** for development
- **Git** for version control

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/j0k/ai_chatter.git
   cd ai-chatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run compile
   ```

4. **Start development mode**
   ```bash
   npm run watch
   ```

## 🧪 Testing the Extension

### Debug Mode

1. **Open the project in VS Code/AI Cursor**
2. **Press F5** to start debugging
3. **A new VS Code window will open** with your extension loaded
4. **Use Command Palette** (`Ctrl+Shift+P`) and search for "AI Chatter" commands

### Manual Testing

1. **Build the extension**
   ```bash
   npm run compile
   ```

2. **Package the extension**
   ```bash
   npm run package
   ```

3. **Install the .vsix file** in VS Code/AI Cursor
   - Go to Extensions view
   - Click "..." menu
   - Select "Install from VSIX"
   - Choose the generated file from `dist/` folder

## 🏗️ Project Architecture

### Core Components

```
src/
├── extension.ts              # Main extension entry point
├── telegram/                 # Telegram bot integration
│   └── TelegramBotManager.ts # Bot lifecycle management
├── ui/                      # User interface components
│   ├── ConfigurationUI.ts   # Configuration webview
│   └── StatusBarManager.ts  # Status bar integration
└── utils/                   # Utility classes
    └── ConfigurationManager.ts # Configuration handling
```

### Key Classes

- **`TelegramBotManager`**: Handles Telegram bot lifecycle and message processing
- **`ConfigurationManager`**: Manages extension configuration and YAML files
- **`ConfigurationUI`**: Provides webview-based configuration interface
- **`StatusBarManager`**: Shows bot status in VS Code status bar

### Data Flow

```
Telegram Bot → TelegramBotManager → ConfigurationManager → VS Code Settings
     ↓              ↓                      ↓                    ↓
  Messages    Message Processing    User Validation    Configuration Storage
```

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the TypeScript files

3. **Test your changes**
   - Use `npm run watch` for automatic rebuilding
   - Press F5 to test in debug mode

4. **Build and test**
   ```bash
   npm run compile
   npm run package
   ```

### Code Style

- **TypeScript**: Use strict mode and proper typing
- **ESLint**: Run `npm run lint` to check code quality
- **Naming**: Use descriptive names and follow camelCase
- **Comments**: Add JSDoc comments for public methods

### Testing Strategy

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Manual Testing**: Test the full extension workflow
- **Telegram Testing**: Test with actual Telegram bot

## 📱 Telegram Bot Development

### Bot Setup

1. **Create a bot with @BotFather**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Follow the setup instructions
   - Save your bot token

2. **Test bot locally**
   - Use the configuration UI to add your token
   - Add your username to authorized users
   - Start the bot and send test messages

### Bot Features

- **Message Handling**: Process incoming Telegram messages
- **User Validation**: Check if users are authorized
- **Response Generation**: Send confirmation messages
- **Error Handling**: Handle bot errors gracefully

## 🔒 Security Considerations

### Token Security

- **Never commit bot tokens** to version control
- **Use environment variables** for production
- **Validate user permissions** before processing messages
- **Rate limiting** for message processing

### User Management

- **Username validation** to prevent injection attacks
- **Maximum user limits** to prevent abuse
- **Secure storage** of configuration data

## 🚀 Deployment

### Publishing

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with new features
3. **Build and package** the extension
4. **Publish to VS Code Marketplace** (when ready)

### Distribution

- **VSIX packages** for manual installation
- **VS Code Marketplace** for automatic installation
- **GitHub Releases** for version distribution

## 🐛 Debugging

### Common Issues

1. **Bot won't start**
   - Check bot token validity
   - Verify network connectivity
   - Check console for error messages

2. **Messages not received**
   - Verify bot is running
   - Check user authorization
   - Test bot with @BotFather

3. **Configuration issues**
   - Validate YAML syntax
   - Check file permissions
   - Verify configuration format

### Debug Tools

- **VS Code Debug Console**: View extension logs
- **Output Channel**: Check "AI Chatter" output
- **Telegram Bot API**: Test bot directly
- **Network Tools**: Monitor API requests

## 📚 Resources

### Documentation

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Webpack Documentation](https://webpack.js.org/)

### Community

- [VS Code Extensions](https://github.com/microsoft/vscode-extension-samples)
- [Telegram Bot Development](https://t.me/botfather)
- [TypeScript Community](https://github.com/microsoft/TypeScript)

## 🤝 Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**
6. **Wait for review and feedback**

### Code Review

- **All changes require review**
- **Tests must pass**
- **Code must meet style guidelines**
- **Documentation must be updated**

---

**Happy coding! 🚀**

If you have questions or need help, please open an issue or join our discussions.
