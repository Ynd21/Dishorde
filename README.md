# 🤖👑 Dishorde - Red Queen Edition

![Red Queen Banner](/readme/banner.jpg)

**A Discord bridge bot for 7 Days to Die with AI integration, comprehensive admin commands, and a dark personality twist.**

[Original Dishorde](https://github.com/LakeYS/Dishorde) | [Support Original Author](https://www.patreon.com/LakeYS) | [Join Discord](https://discord.gg/ZMpSE2a3rs)
------------ | ------------- | -------------

## 🚨 **WARNING: Modified Version**
This is a heavily modified version of Dishorde with AI integration and enhanced features. **DO NOT** submit support tickets to the original Dishorde project for issues with this version.

## ✨ **What's New in Red Queen Edition**

### 🤖 **AI Integration**
- **Intelligent Chat Responses**: AI responds to player messages both in-game and Discord
- **Death Roasts**: Sarcastic AI commentary when players die
- **Configurable Personality**: Customize the AI's personality and behavior
- **Context-Aware**: AI remembers conversation context for better responses

### 👑 **Red Queen Personality**
- **Dark Welcome Messages**: Sarcastic greetings for returning players
- **Themed Console Output**: Stylized startup messages with Red Queen branding
- **Apocalypse Aesthetic**: Dark humor and zombie-themed interactions

### ⚔️ **Enhanced Admin Commands**
- **Player Management**: Advanced kick, ban, kill, and teleport commands
- **World Control**: Spawn entities, control weather, manage whitelist
- **Server Administration**: Save world, execute commands, manage status rotation

### 🎮 **Modern Discord Integration**
- **Slash Commands**: Full Discord slash command support
- **Autocomplete**: Smart player name suggestions
- **Rich Embeds**: Beautiful command responses with emojis
- **Status Rotation**: Dynamic bot status with manual control

## 📋 **Command Overview**

### 🔧 **Public Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `/7dhelp` | ❓ Shows all available commands and their descriptions | `/7dhelp` |
| `/7dinfo` | ℹ️ Get info about the bot | `/7dinfo` |
| `/7dtime` | 🕐 Shows the current game time and date | `/7dtime` |
| `/7dversion` | 📋 Shows the game version | `/7dversion` |
| `/7dplayers` | 👥 Shows a list of online players | `/7dplayers` |
| `/7dweather` | 🌤️ Shows current weather information across all biomes | `/7dweather` |
| `/7dregister` | 🔗 Register your Discord account with your in-game account using a registration code | `/7dregister code:123456` |
| `/7dplayerinfo` | 👤 Shows your player registration information | `/7dplayerinfo` |

### ⚡ **Admin Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `/7dai` | 🤖 Toggle AI integration on/off | `/7dai action:enable` |
| `/7dban` | 🔨 Bans a player from the game server | `/7dban player:Josh reason:Cheating` |
| `/7dbanlist` | 📋 Shows a list of banned players | `/7dbanlist` |
| `/7dexec` | ⚡ Executes a raw command on the telnet server | `/7dexec command:"say Hello"` |
| `/7dgive` | 🎁 Give items to a player | `/7dgive player:Josh item:pistol quantity:1 quality:6` |
| `/7dkick` | 👢 Kicks a player from the game server | `/7dkick player:Josh` |
| `/7dkill` | 💀 Kill a player | `/7dkill player:Josh` |
| `/7dsaveworld` | 💾 Saves the world | `/7dsaveworld` |
| `/7dsetchannel` | 📺 Sets the channel for the server chat | `/7dsetchannel channel:#game-chat` |
| `/7dspawn` | 🧟 Spawn entities, airdrops, or supply crates | `/7dspawn entity type:zombieDog player:Josh count:5` |
| `/7dstatus` | 🎭 Set bot status and activity type | `/7dstatus next:True` |
| `/7dstatusrotate` | 🛡️ Toggle status rotation on/off | `/7dstatusrotate enable:True` |
| `/7dteleport` | 🌀 Teleport a player to coordinates or to another player | `/7dteleport player:Josh target:100,50,200` |
| `/7dunban` | 🔓 Unbans a player from the game server | `/7dunban player:Josh` |
| `/7dwalkersim` | 🧟 Shows walker simulation statistics and information | `/7dwalkersim` |
| `/7dweathercontrol` | 🌤️ Control and view weather conditions | `/7dweathercontrol set type:storm` |
| `/7dwhitelist` | 🔒 Manage server whitelist | `/7dwhitelist add player:Josh` |

## 📖 **Detailed Command Reference**

### 🔧 **Public Commands**
- **`/7dhelp`** - Shows all available commands and their descriptions
- **`/7dinfo`** - Get info about the bot
- **`/7dtime`** - Shows the current game time and date
- **`/7dversion`** - Shows the game version
- **`/7dplayers`** - Shows a list of online players
- **`/7dweather`** - Shows current weather information across all biomes
- **`/7dregister code:123456`** - Register your Discord account with your in-game account using a registration code
- **`/7dplayerinfo`** - Shows your player registration information

### ⚡ **Admin Commands**
- **`/7dai action:enable`** - Toggle AI integration on/off
- **`/7dban player:Josh reason:Cheating`** - Bans a player from the game server
- **`/7dbanlist`** - Shows a list of banned players
- **`/7dexec command:"say Hello"`** - Executes a raw command on the telnet server
- **`/7dgive player:Josh item:pistol quantity:1 quality:6`** - Give items to a player
- **`/7dkick player:Josh`** - Kicks a player from the game server
- **`/7dkill player:Josh`** - Kill a player
- **`/7dsaveworld`** - Saves the world
- **`/7dsetchannel channel:#game-chat`** - Sets the channel for the server chat
- **`/7dspawn entity type:zombieDog player:Josh count:5`** - Spawn entities, airdrops, or supply crates
- **`/7dstatus next:True`** - Set bot status and activity type
- **`/7dstatusrotate enable:True`** - Toggle status rotation on/off
- **`/7dteleport player:Josh target:100,50,200`** - Teleport a player to coordinates or to another player
- **`/7dunban player:Josh`** - Unbans a player from the game server
- **`/7dwalkersim`** - Shows walker simulation statistics and information
- **`/7dweathercontrol set type:storm`** - Control and view weather conditions
- **`/7dwhitelist add player:Josh`** - Manage server whitelist

### 🎯 **Command Features**
- **Autocomplete**: Player names auto-suggest for relevant commands
- **Subcommands**: Complex commands like `/7dwhitelist` have multiple actions
- **Parameter Validation**: Commands validate input ranges and formats
- **Error Handling**: Graceful error messages for failed commands
- **Admin Protection**: Admin commands restricted to Discord administrators

## 🎨 **Features**

### 🤖 **AI Chat System**
- **Dual Platform**: AI responds on both Discord and in-game
- **Smart Triggers**: Responds to questions, mentions, and context
- **Death Commentary**: Roasts players when they die
- **Personality Driven**: Configurable AI personality system

### 👑 **Red Queen Personality**
- **Sarcastic Welcomes**: Dark humor for returning players
- **Themed Messages**: Apocalypse-appropriate responses
- **Visual Styling**: Red Queen branded console output

### ⚔️ **Advanced Admin Tools**
- **Player Autocomplete**: Smart suggestions for player names
- **Rich Feedback**: Detailed command responses with emojis
- **Batch Operations**: Multiple actions in single commands
- **Safety Checks**: Confirmation for destructive actions

### 🎮 **Enhanced Discord Integration**
- **Slash Commands**: Modern Discord command interface
- **Status Rotation**: Dynamic bot status with game info
- **Rich Embeds**: Beautiful formatted responses
- **Error Handling**: Graceful failure recovery

## 🔐 **Player Registration System**

The Red Queen Edition includes a comprehensive player registration system that links Discord accounts to in-game profiles. This enables features like player statistics, welcome messages, and enhanced tracking.

### 📋 **How to Register**

**Step 1: In-Game Registration**
1. Join the 7 Days to Die server
2. Open chat and type: `!register`
3. The bot will send you a **6-digit code** via private message in-game
4. Remember this code (you have 30 minutes to use it)

**Step 2: Discord Registration**
1. Go to your Discord server where the bot is active
2. Use the slash command: `/7dregister code:123456` (replace with your actual code)
3. The bot will confirm your registration and link your accounts

### ✅ **Registration Benefits**
- **Player Statistics**: View your playtime, currency, and activity with `/7dplayerinfo`
- **Welcome Messages**: Get personalized (sarcastic) greetings when you join
- **Enhanced Tracking**: Your sessions and activities are tracked in the database
- **Future Features**: Registration enables additional bot features and commands

### 🔧 **Technical Details**
- **Codes expire** after 30 minutes for security
- **Steam ID linking**: Automatically captures your Steam and Epic/EOS IDs
- **Database storage**: Securely stores registration data locally
- **One-time process**: Registration only needs to be done once per player

### 🚨 **Troubleshooting**
- **Code not working?** Make sure you're using the exact 6-digit number
- **Code expired?** Type `!register` in-game again to get a new code
- **Already registered?** The bot will tell you if your account is already linked
- **No code received?** Check if the bot is connected and telnet is working

## 🔧 **Installation**

### Prerequisites
- Node.js LTS (16.x or higher)
- 7 Days to Die Dedicated Server
- Discord Bot Token
- OpenAI API Key (for AI features)

### Quick Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/Ynd21/Dishorde.git
   cd Dishorde
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the bot**
   ```bash
   cp config.example.json config.json
   # Edit config.json with your settings
   ```

4. **Deploy commands**
   ```bash
   node deploy-commands.js
   ```

5. **Start the bot**
   ```bash
   node index.js
   ```

## ⚙️ **Configuration**

### Basic Settings
```json
{
  "token": "your_discord_bot_token",
  "channel": "your_channel_id",
  "password": "your_telnet_password",
  "ip": "localhost",
  "port": 8081
}
```

### AI Integration
```json
{
  "ai-enabled": true,
  "ai-api-key": "your_openai_api_key",
  "ai-model": "gpt-3.5-turbo",
  "ai-personality": "You are the Red Queen AI from Resident Evil..."
}
```

### Feature Toggles
```json
{
  "enable-welcome-messages": true,
  "disable-chatmsgs": false,
  "disable-join-leave-gmsgs": false,
  "show-discord-bot-msgs": true
}
```

## 🎭 **AI Personality System**

The Red Queen Edition features a sophisticated AI system that can:
- **Respond to Chat**: Engage with players naturally
- **Roast Deaths**: Provide sarcastic commentary on player deaths
- **Remember Context**: Maintain conversation flow
- **Adapt Personality**: Configurable personality traits

### Example AI Interactions
```
Player: "How do I craft a gun?"
AI: "Ah, looking to upgrade from throwing rocks? You'll need a forge, some iron, and the delusion that you'll survive long enough to use it."

Player died!
AI: "Well, that was predictable. Josh managed to die in the most spectacular way possible. The zombies are probably embarrassed."
```

## 🛡️ **Security Notes**

- **Config Protection**: `config.json` is automatically excluded from git
- **Database Security**: Local SQLite database for player data
- **Admin Permissions**: Commands restricted to Discord admin roles
- **Telnet Security**: Secure connection to game server

## 🎨 **Customization**

### Welcome Messages
Edit the `welcomeMessages` array in `index.js` to customize player greetings:
```javascript
const welcomeMessages = [
  "Ah, {name} crawled back from the grave — delightful.",
  "Welcome back, {name}. I was almost rid of you.",
  // Add your own messages...
];
```

### AI Personality
Modify the `ai-personality` setting in `config.json` to change AI behavior:
```json
{
  "ai-personality": "You are a helpful assistant for 7 Days to Die players..."
}
```

## 📊 **Database Features**

- **Player Registration**: Link Discord accounts to game profiles
- **Session Tracking**: Monitor player playtime and activity
- **Command Logging**: Track all admin actions
- **Statistics**: Comprehensive player and server metrics

## 🔄 **Status Rotation**

The bot features dynamic status rotation showing:
- Player count
- Server status
- AI system status
- Custom messages
- Game information

## 🐛 **Troubleshooting**

### Common Issues
1. **Commands not working**: Run `node deploy-commands.js`
2. **AI not responding**: Check OpenAI API key and credits
3. **Connection issues**: Verify telnet settings in game config
4. **Permission errors**: Ensure bot has proper Discord permissions

### Debug Mode
Enable debug logging in `config.json`:
```json
{
  "debug-mode": true,
  "log-telnet": true,
  "log-messages": true
}
```

## 🤝 **Contributing**

This is a personal modification of Dishorde. For the original project:
- [Original Dishorde Repository](https://github.com/LakeYS/Dishorde)
- [Support Original Author](https://www.patreon.com/LakeYS)

## 📜 **License**

This project maintains the original MIT License from Dishorde.

## ⚠️ **Disclaimer**

This modified version includes AI integration and enhanced features. Use at your own risk. The original Dishorde team does not provide support for this version.

---

![Red Queen Avatar](/readme/avatar.png)

*"Welcome to my domain. Try not to disappoint me."* - Red Queen AI

---

**Built with 🤖 AI Integration | 👑 Red Queen Personality | ⚔️ Advanced Commands**