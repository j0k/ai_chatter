#!/bin/bash

# AI Chatter Installation Script for Cursor AI
# This script helps you install the plugin into Cursor AI

echo "🤖 AI Chatter - Cursor AI Installation Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "ai-chatter-0.1.0.vsix" ]; then
    echo "❌ Error: ai-chatter-0.1.0.vsix not found in current directory"
    echo "   Please run this script from the ai-chatter project folder"
    exit 1
fi

echo "✅ Found extension package: ai-chatter-0.1.0.vsix"
echo ""

# Get the full path to the VSIX file
VSIX_PATH=$(pwd)/ai-chatter-0.1.0.vsix
echo "📁 Extension path: $VSIX_PATH"
echo ""

echo "🚀 Installation Instructions for Cursor AI:"
echo "=========================================="
echo ""
echo "1. 📱 Open Cursor AI"
echo "2. ⌨️  Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)"
echo "3. 🔍 Type: 'Extensions: Install from VSIX'"
echo "4. 📂 Navigate to: $VSIX_PATH"
echo "5. ✅ Select the .vsix file and click 'Install'"
echo "6. 🔄 Restart Cursor AI"
echo ""
echo "🔧 After Installation:"
echo "====================="
echo "1. Press Cmd+Shift+P (or Ctrl+Shift+P)"
echo "2. Type: 'AI Chatter: Configure'"
echo "3. Enter your Telegram bot token"
echo "4. Add your username to authorized users"
echo "5. Start the bot with 'AI Chatter: Start Bot'"
echo ""
echo "📱 Create Your Telegram Bot:"
echo "============================"
echo "1. Open Telegram and search for @BotFather"
echo "2. Send: /newbot"
echo "3. Choose a name and username"
echo "4. Save the bot token"
echo ""
echo "🎯 What You'll See:"
echo "=================="
echo "- AI-Chatter status bar item (right side)"
echo "- Click to toggle for current chat"
echo "- Telegram messages appear directly in Cursor AI chat"
echo ""
echo "📚 Need Help?"
echo "============="
echo "- Read CHAT_INTEGRATION_GUIDE.md for detailed usage"
echo "- Check QUICKSTART.md for quick setup"
echo "- Read DEVELOPMENT.md for developer information"
echo "- GitHub: https://github.com/j0k/ai_chatter"
echo ""
echo "🎉 Happy coding with AI from anywhere!"
echo ""
echo "Press any key to continue..."
read -n 1 -s

# Open the folder in Finder (Mac) or File Explorer (Windows/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open .
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    explorer .
else
    # Linux
    xdg-open .
fi

echo "✅ Folder opened! You can now install the extension."
