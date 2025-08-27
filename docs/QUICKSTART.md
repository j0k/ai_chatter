# 🚀 AI Chatter Quick Start Guide

Get your AI Chatter plugin up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install the Extension

**Option A: From VSIX file (Recommended for testing)**
1. Download `ai-chatter-0.1.0.vsix` from the releases
2. Open VS Code/AI Cursor
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file

**Option B: From source (For developers)**
```bash
git clone https://github.com/j0k/ai_chatter.git
cd ai-chatter
npm install
npm run compile
npm run package
# Then install the generated .vsix file
```

### 2. Create Your Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Send `/newbot`** command
3. **Choose a name** for your bot (e.g., "My AI Chatter Bot")
4. **Choose a username** (e.g., "my_ai_chatter_bot")
5. **Save the bot token** - you'll need this next!

### 3. Configure AI Chatter

1. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. **Type "AI Chatter: Configure"** and select it
3. **Enter your bot token** from step 2
4. **Add your username** to authorized users
5. **Click "Update Bot Token"** and "Add User"

### 4. Start the Bot

1. **Open Command Palette** again
2. **Type "AI Chatter: Start Bot"** and select it
3. **You should see** "AI Chatter bot started successfully!"
4. **Check the status bar** - it should show "AI Chatter" with a radio tower icon

### 5. Test It!

1. **Open Telegram** and find your bot
2. **Send a message** to your bot
3. **Check VS Code/AI Cursor** - you should see a notification!
4. **Check the Output panel** - look for "AI Chatter" channel

## 🔧 Troubleshooting

### Bot Won't Start?
- ✅ Check your bot token is correct
- ✅ Make sure you added at least one authorized user
- ✅ Verify your internet connection
- ✅ Check the Output panel for error messages

### Messages Not Received?
- ✅ Verify the bot is running (status bar shows radio tower)
- ✅ Check your username is in the authorized users list
- ✅ Make sure you're messaging the correct bot
- ✅ Try restarting the bot

### Configuration Issues?
- ✅ Use the configuration UI (Command Palette → "AI Chatter: Configure")
- ✅ Check the YAML file format if using file configuration
- ✅ Restart VS Code/AI Cursor after configuration changes

## 📱 What You Can Do Now

### Basic Features (v0.1.0)
- ✅ **Receive messages** from authorized Telegram users
- ✅ **See messages** in VS Code notifications
- ✅ **View logs** in the Output panel
- ✅ **Manage users** through the configuration UI

### Coming Soon
- 🔄 **v0.2.0**: Better user management and YAML config
- 💬 **v0.3.0**: Full Cursor AI chat integration
- 🔒 **v0.4.0**: Workspace access and security
- 🖼️ **v0.5.0**: Image and file support

## 🎯 Next Steps

1. **Test with friends** - add their usernames to authorized users
2. **Customize settings** - adjust max users, bot behavior
3. **Monitor usage** - check the Output panel for activity
4. **Join the community** - report bugs, request features

## 🆘 Need Help?

- 📖 **Read the full README.md** for detailed documentation
- 🐛 **Report issues** on GitHub
- 💬 **Ask questions** in discussions
- 📚 **Check DEVELOPMENT.md** for developer information

---

**🎉 Congratulations! You're now chatting with AI from Telegram!**

Your AI Chatter plugin is ready to bridge the gap between your phone and your coding environment.
