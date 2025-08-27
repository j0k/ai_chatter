# 🤖 AI Chatter

**Copyright (c) 2025 Yuri Konoplev (j0k)**

[![GitHub](https://img.shields.io/badge/GitHub-j0k%2Fai__chatter-blue?style=flat-square&logo=github)](https://github.com/j0k/ai_chatter)
[![License](https://img.shields.io/badge/License-MIT%20WITH%20ATTRIBUTION-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.3.1-orange?style=flat-square)](docs/CHANGELOG.md)
[![Status](https://img.shields.io/badge/Status-TESTING%20PHASE-red?style=flat-square)](#important-testing-phase)
[![Built with Cursor AI](https://img.shields.io/badge/Built%20with-Cursor%20AI-purple?style=flat-square)](https://cursor.sh)

> **Built entirely with Cursor AI** - This project was coded, developed, and built using Cursor AI, demonstrating the power of AI-assisted development.

## ⚠️ **IMPORTANT: TESTING PHASE**

> **🚨 This extension is currently in TESTING PHASE and may not work properly**
> 
> - **Status**: Experimental/Testing - Not production ready
> - **Known Issues**: Several features may not function as expected
> - **UI Integration**: The AI-Chatter checkbox in message tabs is not working
> - **Recommendation**: Use for testing and development purposes only
> - **Contributions**: Welcome! Help improve and fix issues

A powerful VS Code extension that bridges the gap between your Cursor AI workspace and Telegram, allowing you to interact with your AI assistant from your phone while coding on your laptop.

## ✨ **Features**

### 🚀 **Core Functionality**
- **Telegram Integration**: Connect your Cursor AI to Telegram bot
- **Two-Way Communication**: Send messages from Telegram to Cursor AI and receive AI responses back
- **User Management**: Control access with authorized Telegram usernames
- **Real-time Chat**: Instant message delivery between platforms

### 💬 **Communication Commands**
- **`/msg <message>`** - Send messages directly to Cursor AI input field
- **`/msgactive <message>`** - Send messages to currently active/focused element
- **`/help`** - Comprehensive help and command reference
- **`/usage`** - Detailed usage examples and workflows
- **`/history`** - View last 10 messages from both platforms
- **`/version`** - Show current version and build information

### 🛠️ **Utility Commands**
- **`/terminal <command>`** - Execute shell commands safely
- **`/context_size`** - Check Cursor AI context usage
- **`/tabs`** - List all open tabs and identify message tabs
- **`/status`** - Check bot and connection status
- **`/config`** - Show current configuration
- **`/users`** - List authorized users
- **`/cheat <search> <add>`** - Find text and add content after it in all documents

### 🎨 **User Interface**
- **Configuration Panel**: Easy setup and management
- **Message Testing UI**: Built-in testing interface
- **Restart Button**: Bot management and restart functionality
- **Status Indicators**: Real-time feedback and monitoring

## 🚀 **Quick Start**

### **⚠️ Testing Phase Notice**
> **This extension is in testing phase and may have issues. Use for development/testing purposes only.**

### **Prerequisites**
- VS Code or Cursor AI
- Telegram account
- Telegram bot token

### **Installation**
1. **Download Extension**: Get `ai-chatter-0.3.1.vsix`
2. **Install in VS Code**: `Ctrl+Shift+P` → "Extensions: Install from VSIX"
3. **Configure Bot**: Set your `TELEGRAM_BOT_TOKEN`
4. **Add Users**: Configure authorized Telegram usernames
5. **Start Bot**: Enable AI Chatter in your workspace

### **⚠️ Known Issues**
- **UI Integration**: AI-Chatter checkbox in message tabs is not working
- **Message Flow**: Some features may not function as expected
- **Testing Required**: Comprehensive testing and bug fixes needed

### **First Steps**
1. **Open Configuration**: `Ctrl+Shift+P` → "AI Chatter: Open Configuration"
2. **Set Bot Token**: Enter your Telegram bot token
3. **Add Users**: Add up to 10 authorized Telegram usernames
4. **Test Connection**: Send `/help` from Telegram to verify setup

## 📚 **Documentation**

### **📖 Core Guides**
- **[Installation Guide](docs/INSTALL.md)** - Complete setup and installation instructions
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get up and running in minutes
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and development information

### **🎯 Feature Documentation**
- **[v0.2.15 - Cheat Command DOM Modification Fix](docs/V0.2.15_CHEAT_COMMAND_FIX.md)** - Fixed text modification and active editor targeting
- **[v0.2.14 - Enhanced DOM Search & Injection](docs/V0.2.14_DOM_SEARCH_AND_INJECTION.md)** - Search and modify text in documents AND DOM elements
- **[v0.2.13 - Version Info & Advanced Text Manipulation](docs/V0.2.13_VERSION_AND_CHEAT_COMMANDS.md)** - Version info and bulk text editing
- **[v0.2.12 - Active Element Messaging](docs/V0.2.12_ACTIVE_ELEMENT_MESSAGING.md)** - Send messages to currently active elements
- **[v0.2.11 - Direct Messaging](docs/V0.2.11_DIRECT_MESSAGING.md)** - Send messages directly to Cursor AI
- **[v0.2.10 - Restart Button](docs/V0.2.10_RESTART_BUTTON.md)** - Bot management and restart functionality
- **[v0.2.9 - Tabs Command](docs/V0.2.9_TABS_COMMAND.md)** - List and manage open tabs
- **[v0.2.8 - Message Testing UI](docs/V0.2.8_MESSAGE_TESTING.md)** - Built-in testing interface
- **[v0.2.7 - History Command](docs/V0.2.7_HISTORY_COMMAND.md)** - Message history tracking
- **[v0.2.6 - Setup Commands](docs/V0.2.6_SETUP_COMMANDS.md)** - System monitoring and configuration
- **[v0.2.5 - Help System](docs/V0.2.5_HELP_SYSTEM.md)** - Comprehensive help and usage
- **[v0.2.4 - Context Size](docs/V0.2.4_CONTEXT_SIZE.md)** - Monitor AI context usage
- **[v0.2.3 - Terminal Commands](docs/V0.2.3_TERMINAL_COMMANDS.md)** - Execute shell commands
- **[v0.2.0 - Features Overview](docs/V0.2.0_FEATURES.md)** - Core features and capabilities

### **🔧 Technical Documentation**
- **[Chat Integration Guide](docs/CHAT_INTEGRATION_GUIDE.md)** - How chat integration works
- **[Two-Way Communication](docs/TWO_WAY_COMMUNICATION.md)** - Bidirectional messaging system
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - High-level project overview
- **[Testing Guide](docs/TESTING_V0.2.8.md)** - Comprehensive testing instructions

### **📋 Reference**
- **[Changelog](docs/CHANGELOG.md)** - Complete version history and roadmap
- **[Problems & Solutions](docs/PROBLEMS.md)** - Known issues and troubleshooting

## 🎯 **Use Cases**

### **💻 Remote Development**
- Code with AI assistance from anywhere
- Use your phone as a remote control for Cursor AI
- Get immediate help while away from your computer

### **📱 Mobile Coding**
- Send coding questions from your phone
- Request code reviews and debugging help
- Learn new concepts on the go

### **🔄 Team Collaboration**
- Share AI conversations with team members
- Get instant feedback on code
- Collaborate on AI-assisted development

### **🚀 Learning & Education**
- Ask questions about programming concepts
- Get explanations with code examples
- Learn new technologies and frameworks

## 🔧 **Configuration**

### **Environment Variables**
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### **Settings**
- **Max Users**: Up to 10 authorized Telegram users
- **Bot Token**: Your Telegram bot API token
- **Auto-start**: Automatically start bot on extension activation

### **User Management**
- Add/remove authorized Telegram usernames
- Control access to your Cursor AI workspace
- Monitor user activity and sessions

## 🚀 **Development**

### **Built with Cursor AI**
This entire project was **coded, developed, and built using Cursor AI**, showcasing the power of AI-assisted development. From initial concept to final implementation, Cursor AI helped with:

- **Code Generation**: TypeScript/JavaScript implementation
- **Architecture Design**: Modular component structure
- **API Integration**: Telegram Bot API and VS Code Extension API
- **Testing & Debugging**: Comprehensive testing strategies
- **Documentation**: Complete documentation and guides

### **Technology Stack**
- **Language**: TypeScript/JavaScript
- **Platform**: VS Code Extension API
- **APIs**: Telegram Bot API, VS Code Extension API
- **Build Tools**: Webpack, VSCE
- **Dependencies**: node-telegram-bot-api, js-yaml

### **Project Structure**
```
ai_chatter/
├── src/
│   ├── telegram/          # Telegram bot management
│   ├── ui/               # User interface components
│   └── utils/            # Utility functions
├── docs/                 # Documentation
├── package.json          # Extension manifest
└── README.md            # This file
```

## 🤝 **Contributing**

We welcome contributions! This project was built with AI assistance, and we encourage others to explore AI-assisted development.

### **How to Contribute**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Development Setup**
```bash
git clone https://github.com/j0k/ai_chatter.git
cd ai_chatter
npm install
npm run compile
```

## 📄 **License**

This project is licensed under the MIT License WITH ATTRIBUTION - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Cursor AI**: This entire project was built using Cursor AI
- **VS Code Team**: For the excellent extension API
- **Telegram**: For the powerful bot API
- **Open Source Community**: For the amazing tools and libraries

## 🌟 **Why AI Chatter?**

AI Chatter represents the future of development - **AI-assisted tools built with AI assistance**. It demonstrates how AI can help developers create powerful, useful tools that enhance their own development experience.

### **Key Benefits**
- **Seamless Integration**: Connect your phone and laptop seamlessly
- **AI-Powered Development**: Built with and for AI-assisted development
- **Remote Capabilities**: Code from anywhere with AI assistance
- **Team Collaboration**: Share AI conversations and insights
- **Learning Enhancement**: Learn faster with AI assistance

---

**🌐 GitHub Repository**: [https://github.com/j0k/ai_chatter](https://github.com/j0k/ai_chatter)
**📚 Full Documentation**: [docs/](docs/)
**🔧 Installation**: [docs/INSTALL.md](docs/INSTALL.md)
**📋 Changelog**: [docs/CHANGELOG.md](docs/CHANGELOG.md)

**Built entirely with Cursor AI** - Experience the future of AI-assisted development! 🚀
