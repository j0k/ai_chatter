# Changelog

All notable changes to this project will be documented in this file.

**🌐 GitHub Repository**: [https://github.com/j0k/ai_chatter](https://github.com/j0k/ai_chatter)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- 🚀 v1.0.0: Production ready with admin groups
- 🎯 v0.5.0: Media support (images, files)
- 🔒 v0.4.0: Workspace access and security
- 💬 v0.3.0: Full Cursor AI integration
- ⚙️ v0.2.0: User management and UI
- 🏗️ v0.1.0: Core infrastructure

## [0.1.0] - 2025-08-27

### Added
- 🎯 Basic VS Code extension setup
- 🤖 Telegram bot integration foundation
- 📡 Simple message routing system
- 📦 Project structure and dependencies
- 🔧 Basic configuration handling
- 💬 **Chat Integration UI**: AI-Chatter checkbox in status bar
- 🔄 **Direct Chat Injection**: Telegram messages appear directly in Cursor AI chat
- 🎛️ **Per-Chat Toggle**: Enable/disable AI-Chatter for individual chat sessions
- 📱 **Smart Chat Detection**: Automatically detects Cursor AI chat contexts

### Technical
- TypeScript project setup
- VS Code Extension API integration
- Telegram Bot API client
- Basic message handling pipeline

## [0.2.0] - 2025-08-27

### Added
- 🎨 Configuration UI for bot token
- 👥 Username management (up to 10 users)
- 📄 YAML configuration file support
- ✅ User validation system
- 🔐 Secure token storage
- 🎯 **Message Tab Integration**: AI-Chatter checkbox directly in message tab interface
- 🔄 **Inline Toggle**: Checkbox positioned right next to Agent and Auto buttons
- 💬 **Seamless Chat Control**: Enable/disable AI-Chatter directly from message tab
- 🎨 **Enhanced UI**: Native integration with Cursor AI message interface

## [0.2.1] - 2025-08-27

### Added
- 📤 **AI Response Capture**: Automatically captures Cursor AI responses
- 📱 **Telegram Response Routing**: Sends AI responses back to Telegram users
- 🔄 **Two-Way Communication**: Complete Telegram ↔ Cursor AI conversation loop
- 🎯 **Response Detection**: Smart pattern recognition for AI responses
- ⏱️ **Timeout System**: 5-second delay to ensure complete responses
- 🎨 **Response Formatting**: Beautiful Telegram formatting with Markdown support
- 🔧 **Manual Response Command**: Fallback command to manually send responses

## [0.2.3] - 2025-08-27

### Added
- 🖥️ **Terminal Command Execution**: Run shell commands from Telegram chat
- 🔒 **Security Features**: Command validation and blocking system
- 📱 **Command Format**: `/terminal <command>` syntax for easy use
- 🎯 **Safe Commands**: Whitelist of allowed commands (ls, pwd, git, etc.)
- ⚠️ **Dangerous Command Blocking**: Blocks rm, sudo, chmod, etc.
- 📊 **Execution Monitoring**: Timeout protection and execution logging
- 🔄 **Real-time Results**: Command output sent directly to Telegram
- 🎨 **Formatted Output**: Beautiful Markdown formatting for results

## [0.2.4] - 2025-08-27

### Added
- 📊 **Context Size Monitoring**: Check Cursor AI context usage from Telegram
- 🔍 **Smart Detection**: Automatically detects context size in chat interfaces
- 📱 **Context Command**: `/context_size` command for instant status check
- 🎯 **Pattern Recognition**: Detects percentage values (85.4%, 70.4%, etc.)
- 📈 **Usage Visualization**: Visual usage bar and percentage indicators
- ⚠️ **Usage Warnings**: Alerts for high context usage (80%+)
- 💡 **Smart Tips**: Contextual advice based on usage level
- 🔄 **Real-time Updates**: Live context size monitoring and detection

## [0.2.5] - 2025-08-27

### Added
- 📚 **Help System**: Comprehensive help and usage commands for Telegram
- 🆘 **Help Command**: `/help` command with full feature overview
- 📖 **Usage Command**: `/usage` command with practical examples
- 🔗 **GitHub Integration**: Direct links to repository in help messages
- 📱 **Command Reference**: Complete list of available commands
- 💡 **Quick Start Guide**: Step-by-step setup instructions
- ⚡ **Workflow Examples**: Real-world usage scenarios and workflows
- 🎯 **User Onboarding**: Improved user experience for new users

## [0.2.6] - 2025-08-27

### Added
- 🔧 **Setup Commands**: Implemented missing setup commands for Telegram
- 📊 **Status Command**: `/status` command for comprehensive system status
- ⚙️ **Config Command**: `/config` command to view configuration details
- 👥 **Users Command**: `/users` command to see authorized users and sessions
- 🔍 **System Monitoring**: Real-time system health and status information
- 📈 **Performance Metrics**: Memory usage, uptime, and activity tracking
- 🎯 **User Management**: Detailed user status and session information
- 💡 **Configuration Tips**: Smart tips based on current configuration state

## [0.2.11] - 2025-08-27

### Added
- 💬 **Msg Command**: New `/msg <message>` command to send messages directly to Cursor AI
- 📝 **Direct Messaging**: Send messages from Telegram directly into Cursor AI chat tabs
- 🎯 **Smart Insertion**: Messages are inserted at cursor position in active chat tab
- 📱 **Message Formatting**: Clear identification of messages from Telegram
- 🔄 **Real-time Integration**: Immediate message delivery to Cursor AI interface

### Changed
- Enhanced `/help` command to include new `/msg` command
- Updated `/usage` command with `/msg` command examples and workflows
- Improved message handling and user experience
- Better integration between Telegram and Cursor AI

---

## [0.2.10] - 2025-08-27

### Added
- 🔄 **Restart Button**: New restart button in configuration UI above message testing
- 🔄 **Bot Management**: Complete bot restart functionality with status feedback
- 📊 **Status Indicators**: Real-time feedback on restart process
- 🎨 **Enhanced UI**: Prominent restart button with helpful explanations

### Changed
- Enhanced configuration UI with bot management section
- Improved user experience with restart functionality
- Better error handling and status management

---

## [0.2.9] - 2025-08-27

### Added
- 📑 **Tabs Command**: New `/tabs` command to list all open tabs and message tabs
- 🔍 **Tab Detection**: Smart categorization of tabs (Message, Code, Other)
- 📊 **Tab Information**: Detailed tab status, file paths, and line counts
- 🎯 **Active Tab Highlighting**: Visual indicators for currently active tabs
- 💡 **Tab Management Tips**: Helpful guidance for AI Chatter integration

### Changed
- Updated `/help` command to reflect current version (v0.2.9) and all features
- Enhanced `/usage` command with new `/tabs` command examples
- Improved command documentation and user guidance
- Better tab management and AI Chatter integration tips

---

## [0.2.8] - 2025-08-27

### Added
- 💬 **Message Testing UI**: Built-in message testing interface in configuration panel
- 📝 **Input Field**: Large textarea for typing test messages and prompts
- 📤 **Send Button**: One-click message sending to Cursor AI chat
- 🔍 **Smart Tab Detection**: Automatically identifies Cursor AI chat tabs
- 📊 **Real-time Status**: Immediate feedback on message delivery and errors
- ⌨️ **Keyboard Shortcuts**: Ctrl+Enter for quick message sending
- 🎯 **Professional Formatting**: Clear message identification in chat history

### Changed
- Enhanced configuration UI with integrated message testing
- Improved user experience with visual feedback and status indicators
- Better error handling and user guidance for testing scenarios

---

## [0.2.7] - 2025-08-27

### Added
- 🔧 **Message Flow Fix**: Critical fixes for Telegram to Cursor AI message routing
- 📱 **Cursor AI Info Command**: `/info cursor_ai` for comprehensive debugging
- 🔍 **Session Registration**: Proper chat session registration with TelegramBotManager
- 📊 **Debug Logging**: Comprehensive debug logging for troubleshooting
- 🎯 **Session Management**: Improved chat session tracking and management
- 💡 **Troubleshooting Tools**: Smart debugging and issue resolution guidance

### Changed
- Enhanced configuration management
- Improved error handling

## [0.3.0] - 2024-12-XX

### Added
- 💬 Full integration with Cursor AI chat
- 🧵 Message threading system
- 👤 User identification in messages
- 📝 Comprehensive logging
- 🚨 Error handling and notifications

### Changed
- Seamless message flow from Telegram to Cursor AI
- Better user experience

## [0.4.0] - 2024-12-XX

### Added
- 📁 Access to Cursor AI workspace files
- 🔍 Code context integration
- 🛡️ Enhanced security features
- 🔒 Permission management
- 📊 Usage analytics

### Changed
- Improved workspace integration
- Better security model

## [0.5.0] - 2024-12-XX

### Added
- 🖼️ Image handling from Telegram
- 📎 File attachment support
- 🎨 Enhanced message formatting
- 📱 Media preview in Cursor AI
- 🔄 File synchronization

### Changed
- Enhanced media support
- Better file handling

## [1.0.0] - 2024-12-XX

### Added
- 👥 Admin group support
- 🎛️ Advanced configuration options
- 🚀 Performance optimization
- 🧪 Comprehensive testing
- 📚 Full documentation

### Changed
- Production-ready stability
- Enterprise-grade features

---

## Future Versions

### v1.1.0
- 🔐 Advanced authentication
- 📊 Analytics dashboard
- 🌐 Web interface

### v1.2.0
- 🔌 Plugin ecosystem
- 📱 Mobile app companion
- 🤝 Team collaboration features

### v2.0.0
- 👥 Admin telegram group support
- 🏢 Enterprise features
- 🔗 API for third-party integrations
