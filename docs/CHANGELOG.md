# Changelog

All notable changes to this project will be documented in this file.

**🌐 GitHub Repository**: [https://github.com/j0k/ai_chatter](https://github.com/j0k/ai_chatter)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2025-08-27

### Added
- 📤 **File Sending to Telegram**: New `/send_file <filename>` command sends files directly to Telegram
- 📁 **Automatic File Discovery**: Automatically finds files in workspace by name
- 🔍 **File Size Validation**: Checks file size against Telegram's 50MB limit
- 📱 **Rich File Captions**: Includes file info, size, and generation details
- 🧹 **Temporary File Cleanup**: Automatically cleans up temporary files after sending

### Changed
- Enhanced `/debug_commands_txt` to suggest using `/send_file` for easy file sharing
- Updated help system to include file sending capabilities
- Improved file handling with better error messages and user guidance

---

## [0.3.1] - 2025-08-27

### Added
- 📄 **Complete Commands Export**: New `/debug_commands_txt` command generates comprehensive commands list file
- 🔍 **Enhanced Command Testing**: Improved `/test_command` with execution time, result formatting, and troubleshooting
- 🎯 **Command Type Detection**: Automatic categorization of commands (AI/Chat, Cursor AI, Workbench, Editor, etc.)
- 📊 **Command Validation**: Pre-execution checks for command existence and similar command suggestions
- 🚨 **Better Error Handling**: Enhanced error messages with troubleshooting tips and similar command suggestions

### Changed
- Enhanced `/test_command` with execution time tracking and result formatting
- Improved command discovery with better filtering and categorization
- Enhanced help system to include all v0.3.1 features
- Better user guidance for command execution and troubleshooting

---

## [0.3.0] - 2025-08-27

### Added
- 🚀 **Direct Cursor AI Chat Integration**: New `/chat <message>` command for direct AI chat
- 🔍 **Smart Command Discovery**: Automatically tries multiple AI chat commands
- 📝 **Enhanced Message History**: Thread tracking, message types, and user roles
- 🧵 **Message Threading System**: Support for conversation threads
- 👤 **User Identification**: Enhanced user role detection and tracking
- 📊 **Comprehensive Logging**: Detailed logging and output channel integration
- 🚨 **Error Handling**: Robust error handling with fallback methods
- 🔄 **Fallback Messaging**: File-based messaging when direct chat fails

### Changed
- Enhanced message history from 10 to 20 messages
- Improved error handling and user feedback
- Better integration with Cursor AI's native commands
- Enhanced debugging and troubleshooting capabilities

---

## [0.2.17] - 2025-08-27

### Added
- 🔍 **Debug Commands**: New `/debug_commands` to discover available AI/chat commands
- 🧪 **Command Testing**: New `/test_command <command>` to test specific VS Code commands
- 🎯 **AI Command Discovery**: Find all available Cursor AI and chat-related commands
- 📊 **Command Analysis**: Comprehensive list of available VS Code commands

### Changed
- Enhanced debugging capabilities for discovering Cursor AI integration
- Better command discovery and testing functionality
- Improved troubleshooting for AI chat access

---

## [0.2.16] - 2025-08-27

### Added
- 🔍 **Enhanced Webview Detection**: Better logging and feedback for webview panel detection
- 📝 **Improved Error Messages**: More helpful error messages for cheat command failures
- 🎯 **Better User Guidance**: Clear explanations of what was searched and tips for success

### Fixed
- 🚨 **Webview Panel Handling**: Fixed duplicate code and improved webview panel processing
- 🔧 **Method Return Values**: All DOM modification methods now properly return results
- 📊 **Result Tracking**: Better tracking of replacements across different modification methods

### Changed
- Enhanced cheat command error messages with detailed explanations
- Improved logging for webview panel detection and processing
- Better user feedback when no webview panels are found
- Cleaner code structure and error handling

---

## [0.2.15] - 2025-08-27

### Added
- 🎯 **Active Editor Targeting**: Direct modification of currently active editor content
- ✅ **Success Verification**: Confirms when text modifications are actually applied
- 🔔 **User Notifications**: Clear feedback for successful and failed operations
- 📊 **Enhanced Success Tracking**: Real-time verification of text modifications

### Fixed
- 🚨 **Critical Bug**: Cheat command now properly adds text after found patterns
- 🔧 **DOM Modification**: Fixed webview content modification success rate
- 📝 **Text Replacement**: Resolved incomplete text replacement logic
- ✅ **Success Reporting**: Commands now accurately report actual modifications made

### Changed
- Enhanced cheat command to target active editor as primary modification source
- Improved error handling with graceful fallbacks for DOM access
- Better logging and debugging for all modification operations
- Enhanced success notifications and user feedback

---

## [0.2.14] - 2025-08-27

### Added
- 🔍 **Enhanced DOM Search**: Search and modify text in both documents AND DOM elements
- 🎯 **Advanced Text Injection**: Direct manipulation of webview DOM content
- 🚀 **Improved Cheat Command**: Dual search strategy (documents + DOM) simultaneously
- 📊 **Comprehensive Reporting**: Detailed results from both search methods
- 🔧 **DOM Script Injection**: New command for webview DOM manipulation

### Changed
- Enhanced `/cheat` command to search webview panels and DOM elements
- Improved error handling with graceful fallbacks for DOM access
- Better logging and debugging for DOM modification operations
- Enhanced cheat command reporting with document and DOM element counts

---

## [0.2.13] - 2025-08-27

### Added
- 📱 **Version Command**: New `/version` command to show system information and build details
- 🎯 **Cheat Command**: New `/cheat <search> <add>` command for bulk text manipulation
- 🔍 **Bulk Text Modification**: Find and modify text across all open documents
- 📊 **System Transparency**: Complete version information and feature history
- ✏️ **Advanced Text Editing**: Non-destructive text modifications from Telegram

### Changed
- Enhanced `/help` command to include new `/version` and `/cheat` commands
- Updated `/usage` command with comprehensive examples for all features
- Improved command organization and categorization
- Better help system reflecting actual implemented features

---

## [0.2.12] - 2025-08-27

### Added
- 🎯 **MsgActive Command**: New `/msgactive <message>` command to send messages to active elements
- 🎯 **Active Element Targeting**: Send messages to currently focused input fields
- 📝 **Precise Message Delivery**: Target specific UI elements rather than general chat
- 🔍 **Form Automation**: Perfect for populating forms and input fields from Telegram
- 🎯 **Focused Interactions**: Ideal for targeted messaging scenarios

### Changed
- Enhanced `/help` command to include new `/msgactive` command
- Updated `/usage` command with `/msgactive` command examples and workflows
- Improved active element detection and interaction
- Better message targeting and placement control

---

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
- 📑 **Tabs Command**: New `/tabs` command to list all open tabs and identify message tabs
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

---

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

---

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

---

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

---

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

---

## [0.2.1] - 2025-08-27

### Added
- 📤 **AI Response Capture**: Automatically captures Cursor AI responses
- 📱 **Telegram Response Routing**: Sends AI responses back to Telegram users
- 🔄 **Two-Way Communication**: Complete Telegram ↔ Cursor AI conversation loop
- 🎯 **Response Detection**: Smart pattern recognition for AI responses
- ⏱️ **Timeout System**: 5-second delay to ensure complete responses
- 🎨 **Response Formatting**: Beautiful Telegram formatting with Markdown support
- 🔧 **Manual Response Command**: Fallback command to manually send responses

---

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

---

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

---

## [Unreleased]

### Planned
- 🚀 **v1.0.0**: Production ready with admin groups
- 🎯 **v0.5.0**: Media support (images, files)
- 🔒 **v0.4.0**: Workspace access and security
- ⚙️ **v0.2.0**: User management and UI
- 🏗️ **v0.1.0**: Core infrastructure

### Future Versions

#### v1.1.0
- 🔐 Advanced authentication
- 📊 Analytics dashboard
- 🌐 Web interface

#### v1.2.0
- 🔌 Plugin ecosystem
- 📱 Mobile app companion
- 🤝 Team collaboration features

#### v2.0.0
- 👥 Admin telegram group support
- 🏢 Enterprise features
- 🔗 API for third-party integrations
