# 🚀 Install AI-Chatter in Cursor AI

## 📦 **Quick Install (Recommended)**

### **For macOS/Linux:**
```bash
./install.sh
```

### **For Windows:**
```cmd
install.bat
```

## 🔧 **Manual Installation**

### **Step 1: Install Extension**
1. **Open Cursor AI**
2. **Press `Cmd+Shift+P`** (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. **Type**: `Extensions: Install from VSIX`
4. **Select the command** when it appears
5. **Navigate to this folder** and select `ai-chatter-0.1.0.vsix`
6. **Click "Install"**

### **Step 2: Restart Cursor AI**
- **Close Cursor AI completely**
- **Reopen Cursor AI**

### **Step 3: Verify Installation**
- **Press `Cmd+Shift+P`** (or `Ctrl+Shift+P`)
- **Type**: `AI Chatter`
- **You should see 5 commands** available

## 📱 **Setup Your Telegram Bot**

### **Create Bot:**
1. **Open Telegram** and search for `@BotFather`
2. **Send**: `/newbot`
3. **Choose a name** (e.g., "My AI Chatter Bot")
4. **Choose a username** (e.g., "my_ai_chatter_bot")
5. **Save the bot token** - you'll need this!

### **Configure AI-Chatter:**
1. **Press `Cmd+Shift+P`** (or `Ctrl+Shift+P`)
2. **Type**: `AI Chatter: Configure`
3. **Enter your bot token**
4. **Add your username** to authorized users
5. **Click "Update Bot Token"** and "Add User"

### **Start the Bot:**
1. **Press `Cmd+Shift+P`** (or `Ctrl+Shift+P`)
2. **Type**: `AI Chatter: Start Bot`
3. **You should see**: "AI Chatter bot started successfully!"

## 🎯 **What You'll See**

### **Status Bar:**
- **AI-Chatter** checkbox appears on the right side
- **Shows status**: `[NO CHAT]`, `[OFF]`, or `[ON]`
- **Click to toggle** for current chat

### **Commands Available:**
- `AI Chatter: Configure` - Setup bot and users
- `AI Chatter: Start Bot` - Start Telegram bot
- `AI Chatter: Stop Bot` - Stop Telegram bot
- `AI Chatter: Show Status` - Check bot status
- `AI Chatter: Toggle for Current Chat` - Enable/disable for chat

## 🧪 **Test It!**

1. **Enable AI-Chatter** for a Cursor AI chat
2. **Send message** to your Telegram bot from phone
3. **Check your chat** - message should appear as:
   ```
   [Telegram] @yourusername: Your message here
   ```
4. **Cursor AI responds** to the message!

## 🆘 **Need Help?**

- **Installation issues**: Check if Cursor AI supports VSIX extensions
- **Bot won't start**: Verify token and user configuration
- **Messages not appearing**: Check if AI-Chatter is enabled for the chat
- **Detailed usage**: Read `CHAT_INTEGRATION_GUIDE.md`

## 📚 **Files Included**

- `ai-chatter-0.1.0.vsix` - Extension package
- `install.sh` - macOS/Linux installation script
- `install.bat` - Windows installation script
- `CHAT_INTEGRATION_GUIDE.md` - Detailed usage guide
- `QUICKSTART.md` - Quick setup guide

## 🔗 **Project Links**

- **GitHub Repository**: https://github.com/j0k/ai_chatter
- **Issues & Discussions**: https://github.com/j0k/ai_chatter/issues
- **Documentation**: https://github.com/j0k/ai_chatter#readme

---

**🎉 Ready to code with AI from anywhere via Telegram!**
