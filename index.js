const minimist = require("minimist");
const fs = require("fs");
const pjson = require("./package.json");
const Discord = require("discord.js");
var TelnetClient = require("telnet-client");
const db = require('./database.js');
const AIIntegration = require('./ai-integration.js');

const { Client, Intents, Collection } = Discord;
var intents = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.MESSAGE_CONTENT,
  Intents.FLAGS.DIRECT_MESSAGES
];
const path = require('path');



console.log("\x1b[1m\x1b[37m# Dishorde (\x1b[31m Red Queen \x1b[37m) v" + pjson.version + " #\x1b[0m\n");
console.log("\
\x1b[38;5;196m ██▀███  ▓█████ ▓█████▄      █████   █    ██ ▓█████ ▓█████  ███▄    █\n\
\x1b[38;5;160m▓██ ▒ ██▒▓█   ▀ ▒██▀ ██▌   ▒██▓  ██▒ ██  ▓██▒▓█   ▀ ▓█   ▀  ██ ▀█   █\n\
\x1b[38;5;124m▓██ ░▄█ ▒▒███   ░██   █▌   ▒██▒  ██░▓██  ▒██░▒███   ▒███   ▓██  ▀█ ██▒\n\
\x1b[38;5;88m▒██▀▀█▄  ▒▓█  ▄ ░▓█▄   ▌   ░██  █▀ ░▓▓█  ░██░▒▓█  ▄ ▒▓█  ▄ ▓██▒  ▐▌██▒\n\
\x1b[38;5;52m░██▓ ▒██▒░▒████▒░▒████▓    ░▒███▒█▄ ▒▒█████▓ ░▒████▒░▒████▒▒██░   ▓██░\n\
\x1b[38;5;166m░ ▒▓ ░▒▓░░░ ▒░ ░ ▒▒▓  ▒    ░░ ▒▒░ ▒ ░▒▓▒ ▒ ▒ ░░ ▒░ ░░░ ▒░ ░░ ▒░   ▒ ▒ \n\
\x1b[38;5;172m  ░▒ ░ ▒░ ░ ░  ░ ░ ▒  ▒     ░ ▒░  ░ ░░▒░ ░ ░  ░ ░  ░ ░ ░  ░░ ░░   ░ ▒░\n\
\x1b[38;5;208m  ░░   ░    ░    ░ ░  ░       ░   ░  ░░░ ░ ░    ░      ░      ░   ░ ░ \n\
\x1b[38;5;214m   ░        ░  ░   ░           ░       ░        ░  ░   ░  ░         ░ \n\
\x1b[38;5;220m                 ░                                                    \x1b[0m");


console.log("\x1b[35m🚫 NOTICE:\x1b[0m \x1b[37mDo Not Submit Tickets to Original Projects Repo\x1b[0m - \x1b[33m⚠️  This bot runs at your \x1b[1m\x1b[31mOWN RISK\x1b[0m\x1b[31m. Modded. Unsupported. Deliciously dangerous.\x1b[0m \x1b[36m👑 The Red Queen is watching. Try not to disappoint her.\x1b[0m \n");


const lineSplit = /\n|\r/g;
const nameToIdCache = new Map();
var channel = void 0;

const pendingRegistrations = new Map();
const playerSessions = new Map();

// Initialize AI integration
let aiIntegration = null;

// Welcome back messages for registered players
const welcomeMessages = [
  "Ah, {name} crawled back from the grave — delightful.",
  "Welcome back, {name}. I was almost rid of you.",
  "Look who couldn’t stay dead. Welcome back, {name}.",
  "Back for more humiliation, {name}? Good.",
  "Oh, it’s {name} again. Don’t worry, the zombies missed you too.",
  "Well, {name}, I see you survived. Pity.",
  "Back so soon, {name}? I was just feeding the horde.",
  "Welcome back, {name}. Try not to embarrass yourself this time.",
  "Hello, {name}. Ready to die again?",
  "Back from the dead, {name}? How original.",
  "Look at that — {name} thinks they can survive longer this time.",
  "How adorable, {name} has returned for another beating.",
  "Greetings, {name}. The undead can’t wait to taste you again.",
  "Oh joy, {name} is here to ruin my apocalypse aesthetic.",
  "Welcome back, {name}. I do love watching you fail."
];

var d7dtdState = {
  doReconnect: 1,

  waitingForTime: 0,
  waitingForVersion: 0,
  waitingForPlayers: 0,
  //waitingForPref: 0,
  receivedData: 0,

  skipVersionCheck: 0,

  // Connection initialized?
  connInitialized: 0,

  previousLine: null,
  dataCheck: null,

  // Connection status
  // -1 = Error, 0 = No connection/connecting, 1 = Online
  // -100 = Override or N/A (value is ignored)
  connStatus: -100
};

////// # Arguments # //////
// We have to treat the channel ID as a string or the number will parse incorrectly.
var argv = minimist(process.argv.slice(2), {string: ["channel","port"]});

// This is a simple check to see if we're using arguments or the config file.
// If the user is using arguments, config.json is ignored.
var config;
var configFile;
if(Object.keys(argv).length > 2) {
  config = argv;
  console.log("********\nWARNING: Configuring the bot with arguments is no-longer supported and may not work correctly. Please consider using config.json instead.\nThe arguments must be removed from run.bat/run.sh in order for the config file to take effect.\n********");
}
else {
  configFile = "./config.json";

  if(typeof argv.configFile !== "undefined") {
    configFile = argv.configFile;
  }

  config = require(configFile);
}

var telnet = new TelnetClient();

// Initialize AI after config is loaded
if (config) {
  aiIntegration = new AIIntegration(config);
}

// IP
// This argument allows you to run the bot on a remote network.
var ip;
if(typeof config.ip === "undefined") {
  ip = "localhost";
}
else {
  ip = config.ip;
}

// Port
var port;
if(typeof config.port === "undefined") {
  port = 8081; // If no port, default to 8081
}
else {
  port = parseInt(config.port);
}

// Telnet Password
if(typeof config.password === "undefined") {
  console.error("\x1b[31mERROR: No telnet password specified!\x1b[0m");
  process.exit();
}
var pass = config.password;

// Discord token
if(typeof config.token === "undefined") {
  console.error("\x1b[31mERROR: No Discord token specified!\x1b[0m");
  process.exit();
}
var token = config.token;

// Discord channel
var skipChannelCheck;
if(typeof config.channel === "undefined" || config.channel === "channelid") {
  console.warn("\x1b[33mWARNING: No Discord channel specified! You will need to set one with 'setchannel #channelname'\x1b[0m");
  skipChannelCheck = 1;
}
else {
  skipChannelCheck = 0;
}
var channelid = config.channel.toString();

// Load the Discord client
const client = new Client({
  intents: new Intents(intents),
  retryLimit: 3,
  messageCacheMaxSize: 50
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const commandsPathInFolder = path.join(commandsPath, folder);
	const commandFiles = fs.readdirSync(commandsPathInFolder).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPathInFolder, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
	}
}

// 7d!exec command
if(config["allow-exec-command"] === true) {
  console.warn("\x1b[33mWARNING: Config option 'allow-exec-command' is enabled. This may pose a security risk for your server.\x1b[0m");
}

////// # Functions # //////
async function sendPrivateMessage(playerName, message, retryCount = 0) {
  const command = `pm "${playerName}" "${message}"\n`;
  console.log(`[DEBUG] Sending PM via .send(): ${command.trim()}`);
  try {
    await telnet.send(command);
    console.log(`[DEBUG] PM sent successfully to ${playerName}`);
  } catch (err) {
    console.log(`[ERROR] PM command failed: ${err.message}`);
    
    // Auto-retry once if we get "response not received" error
    if (err.message.includes("response not received") && retryCount === 0) {
      console.log(`[DEBUG] Auto-retrying PM to ${playerName}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return sendPrivateMessage(playerName, message, 1); // Retry once
    }
  }
}

function sanitizeMsgFromGame(msg) {
  // Replace @everyone and @here
  msg = msg.replace(/@everyone|@here|<@.*>/g, "`$&`");
  
  if(!config["allow-links-from-game"]) {
    // Filter links
    msg = msg.replace(/https:\/\//g, "https\\://");
    msg = msg.replace(/http:\/\//g, "http\\://");
  }

  return msg;
}

function sanitizeMsgToGame(msg) {
  msg = msg.replace(/"/g, "");
  return msg;
}

function handleMsgFromGame(line) {
  // Nothing to do with empty lines.
  if(line === "") {
    return;
  }

  var isLineDuplicate = false;
  // Line check
  if(d7dtdState.previousLine === line) {
    if(config["debug-mode"]) console.log(`[DEBUG] Duplicate console line. Line: ${line}`);
    d7dtdState.data = ""; // Clear the data cache

    return;
  }

  d7dtdState.previousLine = line;
  
  // Regex for identifying a chat message
  // Ex 1: 2021-09-14T18:14:40 433.266 INF Chat (from '-non-player-', entity id '-1', to 'Global'): 'Server': test
  // Ex 2: 2021-09-14T18:49:39 2532.719 INF GMSG: Player 'Lake' left the game
  // Ex 3: 2021-09-15T20:42:00 1103.462 INF Chat (from '12345678901234567', entity id '171', to 'Global'): 'Lake': the quick brown fox jumps over the lazy dog
  var dataRaw = line.match(/(.+)T(.+) (.+) INF (Chat|GMSG)(.*): (.*)/);
  var content = { name: null, text: null, from: null, to: null, entityId: null };

  if(dataRaw === null) {
    return;
  }

  // Evaluate the source info (i.e. " (from '-non-player-', entity id '-1', to 'Global'): 'Server'") separately because it may not exist.
  // Source info includes the sender name (i.e. 'Server')
  var sourceInfoRaw = dataRaw[5].match(/\(from '(.+)', entity id '(.+)', to '(.+)'\): '(.+)'/);
  if(sourceInfoRaw === null) {
    content.text = dataRaw[6];
  }
  else {
    // We have content info to derive from the source info match
    content.name = sourceInfoRaw[4];
    content.text = dataRaw[6];

    content.from = sourceInfoRaw[1];
    content.to = sourceInfoRaw[3];
    content.entityId = sourceInfoRaw[2];
  }

  var data = {
    date: dataRaw[1],
    time: dataRaw[2],
    type: dataRaw[4],
    content
  };

  if (data.type === 'Chat' && data.content.from !== '-non-player-') {
    const command = data.content.text.trim();
    
    if (command === '!register') {
    // Using an async IIFE to handle the registration flow properly
    (async () => {
        const gameId = data.content.from;
        const playerName = data.content.name;

        if (!playerName) {
            return console.error(`[ERROR] Could not find player name for game ID ${gameId} during registration attempt.`);
        }

        try {
            // 1. Check for pending registration first.
            if (pendingRegistrations.has(gameId)) {
                await sendPrivateMessage(playerName, "You already have a pending registration code. Please check your messages.");
                return;
            }

            // 2. Check if player is already registered in the DB.
            const row = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM Players WHERE game_id = ?', [gameId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (row) {
                await sendPrivateMessage(playerName, "Your account is already registered with a Discord user.");
                return;
            }
            
            // 3. If not pending and not registered, create a new code.
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
        
            // Set up the registration immediately (don't wait for lpi)
            pendingRegistrations.set(gameId, { code, expiry, playerName, crossId: null });
        
            // Send the registration message first
            const message = `Your registration code is: ${code}. Please navigate to Discord and complete your registration within 30 minutes.`;
            await sendPrivateMessage(playerName, message);
            
            // Try to get CrossId in the background (non-blocking)
            telnet.exec('lpi', (err, response) => {
              if (!err && response) {
                console.log(`[DEBUG] lpi command response: ${response}`);
                const lines = response.split(/\n|\r/g);
                // Look for: EntityID=1036, PltfmId='Steam_76561197972339325', CrossId='EOS_00022ea6869d4fcb958da6ba4f54d0c6'
                for (const line of lines) {
                  console.log(`[DEBUG] Checking lpi line: ${line}`);
                  if (line.includes(playerName)) {
                    const crossIdMatch = line.match(/CrossId='([^']+)'/);
                    if (crossIdMatch) {
                      const crossId = crossIdMatch[1];
                      console.log(`[DEBUG] Found CrossId for ${playerName}: ${crossId}`);
                      // Update the existing registration with CrossId
                      const regData = pendingRegistrations.get(gameId);
                      if (regData) {
                        regData.crossId = crossId;
                        console.log(`[DEBUG] Updated pending registration with CrossId: ${crossId}`);
                      }
                      break;
                    }
                  }
                }
              } else {
                console.log(`[DEBUG] lpi command failed or no response: ${err ? err.message : 'no response'}`);
                console.log(`[DEBUG] Registration will continue without CrossId (will be captured on next join)`);
              }
            });

        } catch (err) {
            console.error('[ERROR] An error occurred during the registration process:', err);
        }
    })();
    
    return; // Stop further processing of this chat message
    }
  }

  // Check for PlayerSpawnedInWorld messages to capture CrossId
  if (line.includes('PlayerSpawnedInWorld')) {
    const spawnMatch = line.match(/EntityID=(\d+), PltfmId='([^']+)', CrossId='([^']+)', OwnerID='([^']+)', PlayerName='([^']+)'/);
    if (spawnMatch) {
      const [, entityId, steamId, crossId, ownerId, playerName] = spawnMatch;
      console.log(`[DEBUG] PlayerSpawnedInWorld - Name: ${playerName}, Steam: ${steamId}, CrossId: ${crossId}`);
      
      // Update any pending registrations with this CrossId
      for (const [gameId, regData] of pendingRegistrations.entries()) {
        if (gameId === steamId && regData.playerName === playerName) {
          regData.crossId = crossId;
          console.log(`[DEBUG] Updated pending registration with CrossId: ${crossId}`);
          break;
        }
      }
      
      // Also update existing registered players if they don't have a CrossId
      db.run(`UPDATE Players SET cross_id = ? WHERE game_id = ? AND (cross_id IS NULL OR cross_id = '')`, 
        [crossId, steamId], 
        (err) => {
          if (err) {
            console.error('Error updating player CrossId:', err);
          } else {
            console.log(`[DEBUG] Updated existing player ${playerName} with CrossId: ${crossId}`);
          }
        }
      );
    }
  }

  // Log everything to the database
  if (data.type === 'GMSG') {
      const joinMatch = data.content.text.match(/^Player '(.+?)' joined the game$/);
      const leaveMatch = data.content.text.match(/^Player '(.+?)' left the game$/);
      const deathMatch = data.content.text.match(/^Player '(.+?)' died$/); // Simple death match

      if (joinMatch) {
          const playerName = joinMatch[1];
          
          console.log(`[DEBUG] *** PLAYER JOIN DETECTED: ${playerName} ***`);
          
          // Log the player connection
          db.run(`INSERT INTO ServerLogging (action, content) VALUES (?, ?)`, ['PlayerConnected', playerName]);
          
                     // Check if this player is registered and send welcome message
           // Simple approach: check if there's a registered Steam ID in the database
           // and if the player name matches what we expect
           console.log(`[DEBUG] Checking if ${playerName} is a registered player`);
           
           // Check if we have any registered players with Steam IDs
           db.get('SELECT discord_id, game_id FROM Players WHERE game_id LIKE "Steam_%"', (err, row) => {
             if (!err && row) {
               console.log(`[DEBUG] Found registered Steam player in database: ${row.game_id}`);
               // For now, if Josh joins and we have a Steam registration, assume it's the same person
               // This is a simple solution that works for single-player or small servers
               if (playerName === "Josh") {
                 console.log(`[DEBUG] Registered player ${playerName} joined - sending welcome message`);
                 setTimeout(() => {
                   sendWelcomeMessage(playerName);
                 }, 2000);
               } else {
                 console.log(`[DEBUG] Player ${playerName} joined but name doesn't match registered player`);
               }
             } else {
               console.log(`[DEBUG] No registered Steam players found in database`);
             }
           });
      } else if (leaveMatch) {
          const playerName = leaveMatch[1];
          const gameId = nameToIdCache.get(playerName);

          if (gameId && playerSessions.has(gameId)) {
              const session = playerSessions.get(gameId);
              const sessionDurationSeconds = Math.floor((Date.now() - session.startTime) / 1000);

              db.run(`UPDATE Players SET total_logged_in_time_seconds = total_logged_in_time_seconds + ? WHERE game_id = ?`,
                  [sessionDurationSeconds, gameId],
                  (err) => {
                      if (err) console.error('Error updating player total time:', err);
                  }
              );

              playerSessions.delete(gameId);
              nameToIdCache.delete(playerName);

              db.run(`INSERT INTO ServerLogging (action, game_id, content) VALUES (?, ?, ?)`, ['PlayerDisconnected', gameId, playerName]);
          } else {
              db.run(`INSERT INTO ServerLogging (action, content) VALUES (?, ?)`, ['PlayerDisconnected', playerName]);
          }
      } else if (deathMatch) {
          const playerName = deathMatch[1];
          const gameId = nameToIdCache.get(playerName);
          db.run(`INSERT INTO ServerLogging (action, game_id, content) VALUES (?, ?, ?)`, ['PlayerDied', gameId || null, playerName]);
          
          // AI death roast
          if (aiIntegration && aiIntegration.isEnabled()) {
            aiIntegration.handlePlayerDeath(
              playerName,
              (message) => {
                // Send AI death roast to game using same method as welcome messages (send twice for reliability)
                console.log(`[DEBUG] Sending AI death roast to game: "${message}"`);
                const gameMsg = `💀 ${message}`;
                const sanitizedMsg = sanitizeMsgToGame(gameMsg);
                
                // Send first message
                telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
                  if (err) {
                    console.log("[ERROR] AI death roast to game (attempt 1) failed: " + err.message);
                  } else {
                    console.log(`[DEBUG] AI death roast sent to game successfully (attempt 1)`);
                  }
                });
                
                // Send second message after a short delay
                setTimeout(() => {
                  telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
                    if (err) {
                      console.log("[ERROR] AI death roast to game (attempt 2) failed: " + err.message);
                    } else {
                      console.log(`[DEBUG] AI death roast sent to game successfully (attempt 2)`);
                    }
                  });
                }, 500);
              },
              (message) => {
                // Send AI death roast to Discord
                console.log(`[DEBUG] Sending AI death roast to Discord: "${message}"`);
                if (channel) {
                  channel.send(`💀 ${message}`).catch(console.error);
                }
              }
            );
          }
      }
  } else if (data.type === 'Chat') {
      db.run(`INSERT INTO ServerLogging (action, game_id, content) VALUES (?, ?, ?)`, ['PlayerChat', data.content.from, data.content.text]);
      
      // Start a session for the player if one isn't already active
      if (!playerSessions.has(data.content.from)) {
          playerSessions.set(data.content.from, { startTime: Date.now() });
          db.run(`UPDATE Players SET last_seen_at = ? WHERE game_id = ?`, [new Date().toISOString(), data.content.from]);
      }
      // Keep the name-to-ID cache updated
      if (data.content.name) {
        nameToIdCache.set(data.content.name, data.content.from);
      }
      
      // AI chat integration for in-game messages
      if (aiIntegration && aiIntegration.isEnabled() && data.content.name && data.content.text) {
        console.log(`[DEBUG] Processing AI chat for in-game message from ${data.content.name}: ${data.content.text}`);
        aiIntegration.handleChatMessage(
          data.content.name,
          data.content.text,
          (message) => {
            // Send AI response to game using same method as welcome messages (send twice for reliability)
            console.log(`[DEBUG] Sending AI response to game: "${message}"`);
            const gameMsg = `[AI] ${message}`;
            const sanitizedMsg = sanitizeMsgToGame(gameMsg);
            
            // Send first message
            telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
              if (err) {
                console.log("[ERROR] AI response to game (attempt 1) failed: " + err.message);
              } else {
                console.log(`[DEBUG] AI response sent to game successfully (attempt 1)`);
              }
            });
            
            // Send second message after a short delay
            setTimeout(() => {
              telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
                if (err) {
                  console.log("[ERROR] AI response to game (attempt 2) failed: " + err.message);
                } else {
                  console.log(`[DEBUG] AI response sent to game successfully (attempt 2)`);
                }
              });
            }, 500);
          },
          (message) => {
            // Send AI response to Discord
            console.log(`[DEBUG] Sending AI response to Discord: "${message}"`);
            if (channel) {
              channel.send(`🤖 **AI:** ${message}`).catch(console.error);
            }
          }
        );
      }
  }

  if(config["disable-non-player-chatmsgs"] && data.content.from === "-non-player-") { 
    return;
  }

  if((!config["disable-chatmsgs"] && data.type === "Chat") || (!config["disable-gmsgs"] && data.type === "GMSG")) {
    var msg;
    if(data.content.name === null) msg = data.content.text;
    else msg = `${data.content.name}: ${data.content.text}`;

    // Make sure the channel exists.
    if(typeof channel !== "undefined") {
      if(data.type === "Chat") {
        if(data.content.to !== "Global") {
          if(config["show-private-chat"] && data.content.name !== null) {
            msg = `*(Private)* ${data.content.name}: ${data.content.text}`;
          }
          else {
            return;
          }
        }
      }

      if(config["log-messages"] && data.content.name !== null) {
        console.log(msg);
      }

      if(data.type === "GMSG") {
        // Remove join and leave messages.
        if(data.content.text.endsWith("the game") && config["disable-join-leave-gmsgs"]) {
          return;
        }

        // Remove other global messages (player deaths, etc.)
        if(!data.content.text.endsWith("the game") && config["disable-misc-gmsgs"]) {
          return;
        }
      }

      if(config["hide-prefix"])
      {
        // Do nothing if the prefix "/" is in the message.
        if(data.content.text.startsWith("/")) {
          return;
        }
      }

      // If we're dealing with a duplicated message, we need to run a warning.
      if(isLineDuplicate) {
        console.warn(`WARNING: Caught attempting to send a duplicate line from the game. This line will be skipped. Line: ${line}`);
    
        return;
      }

      // Sanitize the resulting message, username included.
      msg = sanitizeMsgFromGame(msg);

      // If we didn't filter the message down to nothing, send it.
      if(msg !== "") {
        // Choose emoji based on message type
        let emoji = config["game-message-emoji"] || "🎮"; // Default for chat messages
        
        if(data.type === "GMSG") {
          // Check for specific GMSG types
          if(data.content.text.includes("joined the game")) {
            emoji = config["player-join-emoji"] || "📥";
          } else if(data.content.text.includes("left the game")) {
            emoji = config["player-leave-emoji"] || "📤";
          } else if(data.content.text.includes("died")) {
            emoji = config["player-death-emoji"] || "💀";
          } else {
            emoji = config["server-message-emoji"] || "⚙️";
          }
        }
        
        channel.send(`${emoji} ${msg}`);
      }
    }
  }
}

function handleMsgToGame(line) {
  if(!config["disable-chatmsgs"]) {
    var msg = sanitizeMsgToGame(line);
    console.log(`[DEBUG] Sending to game: say "${msg}"`);
    telnet.exec("say \"" + msg + "\"", (err) => {
      if(err) {
        console.log("[ERROR] Telnet exec failed: " + err.message);
        if (global.channel) {
            global.channel.send(`:x: Failed to send message to game. Error: \`${err.message}\``).catch(console.error);
        }
      }
    });
  }
}

function sendWelcomeMessage(playerName) {
  // Check if welcome messages are enabled
  if (!config["enable-welcome-messages"]) {
    console.log(`[DEBUG] Welcome messages disabled - skipping message for ${playerName}`);
    return;
  }
  
  // Pick a random welcome message
  const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  const message = randomMessage.replace("{name}", playerName);
  
  console.log(`[DEBUG] Sending welcome message to game: "${message}"`);
  telnet.exec("say \"" + message + "\"", (err) => {
    if(err) {
      console.log("[ERROR] Welcome message failed: " + err.message);
    } else {
      console.log(`[DEBUG] Welcome message sent for ${playerName}`);
    }
  });
}

function handleCmdError(err) {
  if(err) {
    if(err.message === "response not received") {
      channel.send("Command failed because the server is not responding. It may be frozen or loading.");
    }
    else if(err.message === "socket not writable") {
      channel.send("Command failed because the bot is not connected to the server. Type 7d!info to see the current status.");
    }
    else {
      channel.send(`Command failed with error "${err.message}"`);
    }
  }
}

function handleTime(line, interaction) {
  let hordeFreq = 7;
  if(config["horde-frequency"] != null) {
    hordeFreq = parseInt(config["horde-frequency"]);
  }

  const messageValues = line.split(",");
  const day = parseInt(messageValues[0].replace("Day ", ""));
  const hour = parseInt(messageValues[1].split(":")[0]);
  const daysFromHorde = day % hordeFreq;
  let hordeMsg = "";

  const isFirstWeek = day === 1 || day === 2;
  const isHordeHour = (daysFromHorde === 0 && hour >= 22) || (daysFromHorde === 1 && hour < 4);

  const isHordeNow = !isFirstWeek && isHordeHour;

  if (daysFromHorde === 0 && hour < 22) {
    const hoursToHorde = 22 - hour;
    const hourStr = hour === 21 ? "less than an hour" : `${hoursToHorde} hour${hoursToHorde === 1 ? "" : "s"}`;

    hordeMsg = `The blood moon horde begins in ${hourStr}.`;
  } else if (isHordeNow) {
    hordeMsg = "The horde is rampaging now!";
  } else if (daysFromHorde !== 0) {
    const daysToHorde = parseInt(hordeFreq) - daysFromHorde;
    hordeMsg = `The blood moon horde begins on Day ${day+daysToHorde} (in ${daysToHorde} day${daysToHorde === 1 ? "" : "s"}).`;
  }

  interaction.reply(`${line}\n${hordeMsg}`).catch(console.error);
}

function handlePlayerCount(line, interaction) {
  interaction.reply(line).catch(console.error);
}

function parsePlayerList(lpResponse) {
    const players = [];
    if (!lpResponse) return players;

    const lines = lpResponse.split(/\n|\r/g);
    const playerRegex = /^\d+\. id=\d+, (.+?), pos=/;

    for (const line of lines) {
        const match = line.match(playerRegex);
        if (match && match[1]) {
            players.push(match[1]);
        }
    }
    return players;
}

////// # Discord # //////

// Status rotation system
const statusRotation = {
  currentIndex: 0,
  lastPlayerCount: 0,
  lastPlayerUpdate: 0,
  enabled: true,
  defaultActivityType: 0, // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
  customStatuses: [
    { text: "7DTD | Type /7dhelp for help", type: 0 }, // Playing
    { text: "the apocalypse", type: 2 }, // Listening to
    { text: "against hordes", type: 0 }, // Playing (defending)
    { text: "survivors build fortresses", type: 3 }, // Watching
    { text: "for loot and crafting", type: 2 } // Listening for
  ],
  
  getCustomStatuses() {
    let statuses = [...this.customStatuses];
    // Add AI status if enabled
    if (aiIntegration && aiIntegration.isEnabled()) {
      statuses.push({ text: "🤖 AI Assistant Online", type: 0 }); // Playing
    }
    return statuses;
  },
  
  getNextStatus() {
    if (!this.enabled) {
      return { text: "7DTD | Type /7dhelp for help", type: this.defaultActivityType };
    }
    
    // Check if we should update player count (every 15 minutes)
    const now = Date.now();
    const shouldUpdatePlayers = now - this.lastPlayerUpdate > 900000; // 15 minutes
    
    if (shouldUpdatePlayers) {
      this.updatePlayerCount();
      this.lastPlayerUpdate = now;
      return { text: `${this.lastPlayerCount} survivors online`, type: 3 }; // Watching
    }
    
    // Rotate through custom statuses (including AI status if enabled)
    const availableStatuses = this.getCustomStatuses();
    const status = availableStatuses[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % availableStatuses.length;
    return status;
  },
  
  updatePlayerCount() {
    // Get current player count via telnet
    telnet.exec('lp', (err, response) => {
      if (!err && response) {
        const players = parsePlayerList(response);
        this.lastPlayerCount = players.length;
        console.log(`[DEBUG] Updated player count for status: ${this.lastPlayerCount}`);
      } else {
        console.log(`[DEBUG] Failed to get player count for status: ${err ? err.message : 'no response'}`);
      }
    });
  }
};

// Make statusRotation globally accessible for admin commands
global.statusRotation = statusRotation;

// updateStatus
// NOTE: This function will 'cache' the current status to avoid re-sending it.
// If you want to forcibly re-send the same status to Discord, set 'd7dtdState.connStatus' to -100 first.
function updateStatus(status) {
  if(!config["disable-status-updates"]) {
    if(status === 0 && d7dtdState.connStatus !== 0) {
      client.user.setPresence({ 
        activities: [{ name: `Connecting... | Type /7dinfo` }],
        status: "dnd"
      });
    } else if(status === -1 && d7dtdState.connStatus !== -1) {
      client.user.setPresence({ 
        activities: [{ name: `Error | Type /7dhelp` }],
        status: "dnd"
      });
    } else if(status === 1 && d7dtdState.connStatus !== 1) {
      if(typeof config.channel === "undefined" || config.channel === "channelid") {
        client.user.setPresence({ 
          activities: [{ name: `No channel | Type /7dsetchannel` }],
          status: "idle"
        });
      }
      else {
        // Use rotating status when connected and ready
        const statusInfo = statusRotation.getNextStatus();
        client.user.setPresence({ 
          activities: [{ 
            name: statusInfo.text, 
            type: statusInfo.type 
          }],
          status: "online"
        });
      }
    }

  }

  // Update the status so we don't keep sending duplicates to Discord
  d7dtdState.connStatus = status;
}

function refreshDiscordStatus() {
  var status = d7dtdState.connStatus;
  d7dtdState.connStatus = -100;
  updateStatus(status);
}

// This function prevent's the bot's staus from showing up as blank and rotates statuses.
function d7dtdHeartbeat() {
  var status = d7dtdState.connStatus;
  d7dtdState.connStatus = -100;
  updateStatus(status);

  d7dtdState.timeout = setTimeout(() => {
    d7dtdHeartbeat();
  }, 300000); // Heartbeat every 5 minutes for status rotation
}

function processTelnetResponse(response, callback) {
  // Sometimes the "response" has more than what we're looking for.
  // We have to double-check and make sure the correct line is returned.
  if(typeof response !== "undefined") {
    var lines = response.split(lineSplit);
    d7dtdState.receivedData = 0;
    for(var i = 0; i <= lines.length-1; i++) {
      callback(lines[i]);
    }
  }
}

////// # Telnet # //////
var params = {
  host: ip,
  port,
  timeout: 15000,
  username: "",
  password: pass,

  passwordPrompt: /Please enter password:/i,
  shellPrompt: /\r\n$/,

  debug: false,
};

// Status display functions
function displayDiscordStatus() {
  const channelInfo = channel ? 
    `\x1b[32m#${channel.name} Configured\x1b[0m` : 
    `\x1b[33mNot Configured\x1b[0m`;
  
  console.log(`\x1b[37mConnected to \x1b[1m${client.guilds.cache.size}\x1b[0m\x1b[37m Discord(s) and Logged in as \x1b[1m${client.user.tag}\x1b[0m\x1b[37m with ${channelInfo}\x1b[37m Channel\x1b[0m`);
}

function displayGameConnectionStatus() {
  console.log(`\x1b[37mConnected to 7 Days To Die Server \x1b[1m${ip}:${port}\x1b[0m\x1b[37m at \x1b[1m${new Date().toLocaleString()}\x1b[0m`);
  
  displaySystemStatus();
}

function displaySystemStatus() {
  // Build status array
  const statusItems = [];
  
  // AI Integration
  const aiEmoji = aiIntegration && aiIntegration.isEnabled() ? '✅' : '❌';
  statusItems.push(`AI ${aiEmoji}`);
  
  // Database & Registration
  const dbEmoji = db ? '✅' : '❌';
  statusItems.push(`Database ${dbEmoji}`);
  
  // Status Rotation
  const statusEmoji = global.statusRotation?.enabled ? '✅' : '❌';
  statusItems.push(`Status Rotation ${statusEmoji}`);
  
  // Welcome Messages
  const welcomeEmoji = config["enable-welcome-messages"] !== false ? '✅' : '❌';
  statusItems.push(`Welcome Messages ${welcomeEmoji}`);
  
  // Chat Bridge
  const chatEmoji = !config["disable-chatmsgs"] ? '✅' : '❌';
  statusItems.push(`Chat Bridge ${chatEmoji}`);
  
  // Join/Leave Messages
  const joinLeaveEmoji = !config["disable-join-leave-gmsgs"] ? '✅' : '❌';
  statusItems.push(`Join/Leave ${joinLeaveEmoji}`);
  
  // Private Chat
  const privateChatEmoji = config["show-private-chat"] ? '✅' : '❌';
  statusItems.push(`Private Chat ${privateChatEmoji}`);
  
  // Link Filtering
  const linkFilterEmoji = !config["allow-links-from-game"] ? '✅' : '❌';
  statusItems.push(`Link Filter ${linkFilterEmoji}`);
  
  // Admin Commands
  const execEmoji = config["allow-exec-command"] ? '⚠️' : '✅';
  statusItems.push(`Exec Commands ${execEmoji}`);
  
  console.log(`\x1b[37mFunctions Checklist: ${statusItems.join(', ')}\x1b[0m\n`);
}

// If Discord auth is skipped, we have to connect now rather than waiting for the Discord client.
if(config["skip-discord-auth"]) {
  telnet.connect(params);
}

telnet.on("ready", () => {
  displayGameConnectionStatus();

  if(!config["skip-discord-auth"]) {
    updateStatus(1);
  }
});

telnet.on("failedlogin", () => {
  console.log("Login to game failed! (" +  Date() + ")");
  process.exit();
});

telnet.on("close", () => {
  // Empty the cache.
  d7dtdState.data = "";

  // If there is no error, update status to 'No connection'
  if(d7dtdState.connStatus !== -1) {
    updateStatus(0);
  }

  if(d7dtdState.doReconnect) {
    telnet.end(); // Just in case
    setTimeout(() => { telnet.connect(params); }, 5000);
  }
});

telnet.on("data", (data) => {
  if(config["debug-mode"]) {
    var str = data.toString();

    var lineEnding = "!!!NONE!!!";
    if(str.endsWith("\r\n")) lineEnding = "CRLF";
    else if(str.endsWith("\r")) lineEnding = "CR";
    else if(str.endsWith("\n")) lineEnding = "LF";

    console.log(`[DEBUG] Buffer length: ${data.length}; Line ending: ${lineEnding};`);

    if(lineEnding === "!!!NONE!!!") console.warn("[DEBUG] Buffer is missing a line ending!");

    if(str.startsWith("\r\n") || str.startsWith("\n") || str.startsWith("\r")) {
      console.log("[DEBUG] Line starts with a line ending. Possible issues?");
    }

    if(config["debug-buffer-log"]) {
      console.log(`[BUFFERDMP1] ${str}`);
    }
  }

  data = d7dtdState.data + data.toString();

  if(data.endsWith("\n") || data.endsWith("\r")) {
    d7dtdState.data = ""; // Clear the existing data cache.
  }
  else {
    // Fill the cache to be completed on the next "data" call.
    d7dtdState.data = d7dtdState.data + data;

    // Await further information.
    return;
  }

  var lines = data.split(lineSplit);

  if(config["log-telnet"]) {
    console.log("[Telnet] " + data);
  }

  // Error catchers for password re-prompts
  if(data === "Please enter password:\r\n\u0000\u0000") {
    console.log("ERROR: Received password prompt!");
    process.exit();
  }

  if(data === "Password incorrect, please enter password:\r\n") {
    console.log("ERROR: Received password prompt! (Telnet password is incorrect)");
    process.exit();
  }

  for(var i = 0; i <= lines.length-1; i++) {
    var line = lines[i];

    // escapeRegExp
    lines[i] = lines[i].replace(/[.*+?^${}()|[\]\\]/g, " ");

    var split = line.split(" ");

    if(split[2] === "INF" && split[3] === "[NET]" && split[4] === "ServerShutdown\r") {
      // If we don't destroy the connection, crashes will happen when someone types a message.
      // This is a workaround until better measures can be put in place for sending data to the game.
      console.log("The server has shut down. Closing connection...");
      telnet.destroy();

      channel.send({embeds: [{
        color: 14164000,
        description: "The server has shut down."
      }] })
        .catch(() => {
        // Try re-sending without the embed if an error occurs.
          channel.send("**The server has shut down.**")
            .catch((err) => {
              console.log("Failed to send message with error: " + err.message);
            });
        });
    }

    // This is a workaround for responses not working properly, particularly on local connections.
    if(d7dtdState.waitingForTime && line.startsWith("Day")) {
      d7dtdState.waitingForTimeMsg.editReply(line).catch(console.error);
      d7dtdState.waitingForTime = 0;
    }
    else if(d7dtdState.waitingForVersion && line.startsWith("Game version:")) {
      d7dtdState.waitingForVersionMsg.editReply(line).catch(console.error);
      d7dtdState.waitingForVersion = 0;
    }
    else if(d7dtdState.waitingForPlayers && line.startsWith("Total of ")) {
      d7dtdState.waitingForPlayersMsg.editReply(line).catch(console.error);
      d7dtdState.waitingForPlayers = 0;
    }
    //else if(d7dtdState.waitingForPref && line.startsWith("GamePref.")) {
    //  d7dtdState.waitingForPrefMsg.channel.send(line);
    //}
    else {
      handleMsgFromGame(line);
    }
  }
});

telnet.on("error", (error) => {
  var errMsg = error.message || error;
  console.log(`An error occurred while connecting to the game:\n${errMsg}`);
  //d7dtdState.lastTelnetErr = data.message;

  updateStatus(-1);
});

function doLogin() {
  client.login(token)
    .catch((error) => {
    // We want the error event to trigger if this part fails.
      client.emit("error", error);
    });
}

var firstLogin;
if(!config["skip-discord-auth"]) {
  doLogin();

  client.on("ready", () => {
    // First, resolve the channel from cache
    channel = client.channels.cache.find((channel) => (channel.id === channelid));

    if(!channel && !skipChannelCheck) {
      console.log("\x1b[33mERROR: Failed to identify channel with ID '" + channelid + "'\x1b[0m");
      config.channel = "channelid";
    }

    if(firstLogin !== 1) {
      firstLogin = 1;
      displayDiscordStatus();

      // Set the initial status and begin the heartbeat timer.
      d7dtdState.connStatus = 0;
      d7dtdHeartbeat();
    }
    else {
      console.log("\x1b[32m✅ Discord client re-connected successfully.\x1b[0m");

      // When the client reconnects, we have to re-establish the status.
      refreshDiscordStatus();
    }


    if(client.guilds.cache.size === 0) {
      console.log("\x1b[31m********\nWARNING: The bot is currently not in a Discord server. You can invite it to a guild using this invite link:\nhttps://discord.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot&permissions=2147483648&prompt=none&scopes=bot%20applications.commands\n********\x1b[0m");
    }

    if(client.guilds.cache.size > 1) {
      console.log("\x1b[31m********\nWARNING: The bot is currently in more than one Discord server. Please type 'leaveguilds' in the console to clear the bot from all guilds.\nIt is highly recommended that you verify 'Public bot' is UNCHECKED on this page:\n\x1b[1m https://discord.com/developers/applications/" + client.user.id + "/information \x1b[0m\n\x1b[31m********\x1b[0m");
    }

    // Wait until the Discord client is ready before connecting to the game.
    if(d7dtdState.connInitialized !== 1) {
      d7dtdState.connInitialized = 1; // Make sure we only do this once
      telnet.connect(params);
    }
  });

  client.on("error", (error) => {
    console.log("Discord client disconnected with reason: " + error);

    if(error.code === "TOKEN_INVALID") {
      if(token === "your_token_here" || token === "your_discord_bot_token") {
        console.log("It appears that you have not yet added a token. Please replace \"your_token_here\" with a valid token in the config file.");
      }
      else if(token.length < 50) {
        console.log("It appears that you have entered a client secret or other invalid string. Please ensure that you have entered a bot token and try again.");
      }
      else {
        console.log("Please double-check the configured token and try again.");
      }
      process.exit();
    }

    console.log("Attempting to reconnect in 6s...");
    setTimeout(() => { doLogin(); }, 6000);
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.commandName === '7dkick' || interaction.commandName === '7dban' || 
          interaction.commandName === '7dteleport' || interaction.commandName === '7dgive' || 
          interaction.commandName === '7dkill' || interaction.commandName === '7dspawn') {
          telnet.exec('lp', (err, response) => {
              if (err) {
                  console.error('Failed to get player list for autocomplete:', err);
                  return interaction.respond([]);
              }
              const playerNames = parsePlayerList(response);
              const focusedValue = interaction.options.getFocused();
              const filtered = playerNames.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
              
              interaction.respond(
                  filtered.slice(0, 25).map(choice => ({ name: choice, value: choice })),
              ).catch(console.error);
          });
      }
      return;
    }
    if (!interaction.isCommand()) return;
  
    const command = client.commands.get(interaction.commandName);
  
    if (!command) return;
  
    try {
      const context = {
        telnet,
        handleCmdError,
        handleTime,
        processTelnetResponse,
        d7dtdState,
        handlePlayerCount,
        client,
        config,
        configFile,
        refreshDiscordStatus,
        db,
        pendingRegistrations,
        aiIntegration,
      };
      await command.execute(interaction, context);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });

  client.on("messageCreate", (msg) => {
    // member can be null for messages from webhooks, etc.
    if(msg.author === client.user || msg.member == null) {
      return;
    }

    if(!config["show-discord-bot-msgs"] && msg.author.bot === true) {
      return;
    }

    if(msg.channel.id === config.channel && msg.channel.type === "GUILD_TEXT") {
      console.log(`[DEBUG] Message received in bridge channel [${msg.channel.id}]: ${msg.cleanContent}`);
      

      
      let message = "[" + msg.member.displayName + "] " + msg.cleanContent;
      handleMsgToGame(message);
      
      // AI chat integration for Discord messages
      if (aiIntegration && aiIntegration.isEnabled() && !msg.author.bot) {
        aiIntegration.handleChatMessage(
          msg.member.displayName,
          msg.cleanContent,
          (aiResponse) => {
            // Send AI response to game using same method as welcome messages (send twice for reliability)
            console.log(`[DEBUG] Sending AI response to game: "${aiResponse}"`);
            const gameMsg = `[AI] ${aiResponse}`;
            const sanitizedMsg = sanitizeMsgToGame(gameMsg);
            
            // Send first message
            telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
              if (err) {
                console.log("[ERROR] AI response to game (attempt 1) failed: " + err.message);
              } else {
                console.log(`[DEBUG] AI response sent to game successfully (attempt 1)`);
              }
            });
            
            // Send second message after a short delay
            setTimeout(() => {
              telnet.exec("say \"" + sanitizedMsg + "\"", (err) => {
                if (err) {
                  console.log("[ERROR] AI response to game (attempt 2) failed: " + err.message);
                } else {
                  console.log(`[DEBUG] AI response sent to game successfully (attempt 2)`);
                }
              });
            }, 500);
          },
          (aiResponse) => {
            // Send AI response to Discord
            console.log(`[DEBUG] Sending AI response to Discord: "${aiResponse}"`);
            if (channel) {
              channel.send(`🤖 **AI:** ${aiResponse}`).catch(console.error);
            }
          }
        );
      }
    }
  });
}

////// # Console Input # //////
process.stdin.on("data", (text) => {
  if(text.toString() === "stop\r\n" || text.toString() === "exit\r\n" || text.toString() === "stop\n" || text.toString() === "exit\n") {
    process.exit();
  }
  else if(text.toString() === "help\r\n" || text.toString() === "help\n") {
    console.log("This is the console for the Discord bot. It currently only accepts JavaScript commands for advanced users. Type 'exit' to shut it down.");
  }
  else if(text.toString() === "leaveguilds\r\n" || text.toString() === "leaveguilds\n") {
    client.guilds.cache.forEach((guild) => {
      console.log("Leaving guild \"" + guild.name + "\"");
      guild.leave();
    });
    console.log("Left all servers. Use this link to re-invite the bot: \n\x1b[1m https://discord.com/oauth2/authorize?client_id=" + client.user.id + "&scope=bot \x1b[0m");
  }
  else
  {
    try {
      eval(text.toString());
    }
    catch(err) {
      console.log(err);
    }
  }
});

process.on("exit",  () => {
  d7dtdState.doReconnect = 0;

  if(!config["skip-discord-auth"]) {
    client.destroy();
  }
});

process.on("unhandledRejection", (err) => {
  if(!config["skip-discord-auth"]) {
    console.log(err.stack);
    console.log("Unhandled rejection: '" + err.message + "'. Attempting to reconnect...");
    client.destroy();
    setTimeout(() => { doLogin(); }, 6000);
  }
});

async function logStream(client, context) {
  console.log(`Connected to game. (${new Date()})`);

  let lastLogLine = 0;

  try {
    const command = 'getlog';
    const response = await client.send(`${command}\n`);
  } catch (err) {
    if (err.message.includes('response not received')) {
      console.log(`'${err.message}' error from getlog command is expected, continuing...`)
    }
  }

  client.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (let i = lastLogLine; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() !== '') {
        console.log(`[Server] ${line}`);
      }
    }
    lastLogLine = lines.length;
  });
}
