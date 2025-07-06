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
| `/7dhelp` | 📚 Show all available commands | `/7dhelp` |
| `/7dinfo` | ℹ️ Show server connection status | `/7dinfo` |
| `/7dtime` | 🕐 Get current game time and horde info | `/7dtime` |
| `/7dversion` | 📋 Show game version | `/7dversion` |
| `/7dplayers` | 👥 List online players | `/7dplayers` |
| `/7dweather` | 🌤️ Check current weather | `/7dweather` |
| `/7dregister` | 🔐 Register your Discord account | `/7dregister code:123456` |
| `/7dplayerinfo` | 👤 Get your player statistics | `/7dplayerinfo` |

### ⚡ **Admin Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `/7dkick` | 👢 Kick a player | `/7dkick player:Josh` |
| `/7dban` | 🔨 Ban a player | `/7dban player:Josh reason:Cheating` |
| `/7dunban` | ✅ Unban a player | `/7dunban player:Josh` |
| `/7dbanlist` | 📜 Show banned players | `/7dbanlist` |
| `/7dkill` | 💀 Kill a player | `/7dkill player:Josh` |
| `/7dteleport` | 🌐 Teleport player | `/7dteleport player:Josh target:100,50,200` |
| `/7dgive` | 🎁 Give items to player | `/7dgive player:Josh item:pistol quantity:1 quality:6` |
| `/7dwhitelist` | 🔒 Manage whitelist | `/7dwhitelist add player:Josh` |
| `/7dspawn` | 🧟 Spawn entities | `/7dspawn entity type:zombieDog player:Josh count:5` |
| `/7dweathercontrol` | 🌩️ Control weather | `/7dweathercontrol set type:storm` |
| `/7dstatus` | 📊 Bot status management | `/7dstatus next:True` |
| `/7dstatusrotate` | 🔄 Toggle status rotation | `/7dstatusrotate enable:True` |
| `/7dsetchannel` | 📢 Set chat channel | `/7dsetchannel channel:#game-chat` |
| `/7dsaveworld` | 💾 Save the world | `/7dsaveworld` |
| `/7dexec` | ⚙️ Execute console command | `/7dexec command:"say Hello"` |
| `/7dwalkersim` | 🚶 Walker simulation | `/7dwalkersim enable:True` |
| `/7dai` | 🤖 AI system control | `/7dai reload` |

## 📖 **Detailed Command Reference**

### 🔧 **Public Commands**
- **`/7dhelp`** - Shows all available commands with descriptions
- **`/7dinfo`** - Displays bot connection status and version info
- **`/7dtime`** - Shows current game time and blood moon horde countdown
- **`/7dversion`** - Displays game server version
- **`/7dplayers`** - Lists all currently online players
- **`/7dweather`** - Comprehensive weather report for all biomes
- **`/7dregister code:123456`** - Links your Discord account to your game profile
- **`/7dplayerinfo`** - Shows your registration details and play statistics

### ⚡ **Admin Commands**
- **`/7dkick player:Josh`** - Kicks a player from the server
- **`/7dban player:Josh reason:Cheating`** - Bans a player (reason optional)
- **`/7dunban player:Josh`** - Removes a ban from a player
- **`/7dbanlist`** - Shows all currently banned players
- **`/7dkill player:Josh`** - Kills a player with public announcement
- **`/7dteleport player:Josh target:100,50,200`** - Teleports player to coordinates or another player
- **`/7dgive player:Josh item:pistol quantity:1 quality:6`** - Gives items to a player
- **`/7dwhitelist add|remove|list|enable|disable player:Josh`** - Manages server whitelist
- **`/7dspawn entity type:zombieDog player:Josh count:5`** - Spawns zombies, animals, airdrops, or supply crates
- **`/7dweathercontrol set type:storm`** - Controls weather conditions and temperature
- **`/7dstatus next:True`** - Manages bot status and manually rotates status
- **`/7dstatusrotate enable:True`** - Enables/disables automatic status rotation
- **`/7dsetchannel channel:#game-chat`** - Sets the Discord channel for game chat
- **`/7dsaveworld`** - Forces a world save
- **`/7dexec command:"say Hello"`** - Executes raw console commands (if enabled)
- **`/7dwalkersim enable:True`** - Manages walker simulation
- **`/7dai reload`** - Controls AI system (reload, status, etc.)

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