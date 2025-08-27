#!/bin/bash

# AI Chatter Development Setup Script
# This script will help you set up the development environment

echo "🤖 AI Chatter Development Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the extension
echo "🔨 Building the extension..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the extension"
    exit 1
fi

echo "✅ Extension built successfully"

# Create example configuration
echo "📝 Creating example configuration..."
mkdir -p .vscode
if [ ! -f .vscode/ai-chatter.yml ]; then
    cp .vvscode/ai-chatter.yml.example .vscode/ai-chatter.yml
    echo "✅ Example configuration created at .vscode/ai-chatter.yml"
    echo "   Please edit this file with your bot token and authorized users"
else
    echo "ℹ️  Configuration file already exists"
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "1. 📱 Create a Telegram bot with @BotFather"
echo "2. ⚙️  Edit .vscode/ai-chatter.yml with your bot token"
echo "3. 🚀 Press F5 in VS Code to test the extension"
echo "4. 📚 Read DEVELOPMENT.md for more information"
echo ""
echo "Happy coding! 🚀"
