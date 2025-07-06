const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dhelp')
    .setDescription('Shows all available commands and their descriptions.'),
  async execute(interaction, { client, config }) {
    try {
      await interaction.deferReply({ ephemeral: true });
      
      // Check if user has admin permissions
      const isAdmin = interaction.member.permissions.has('ADMINISTRATOR') || 
                     (config['admin-role-id'] && interaction.member.roles.cache.has(config['admin-role-id']));
      
      // Get all commands from the client
      const commands = client.commands;
      
      // Separate commands by category
      const adminCommands = [];
      const utilityCommands = [];
      
      // Read command files to determine categories
      const commandsPath = path.join(__dirname, '..');
      const commandFolders = fs.readdirSync(commandsPath);
      
      for (const folder of commandFolders) {
        const commandsPathInFolder = path.join(commandsPath, folder);
        if (fs.statSync(commandsPathInFolder).isDirectory()) {
          const commandFiles = fs.readdirSync(commandsPathInFolder).filter(file => file.endsWith('.js'));
          
          for (const file of commandFiles) {
            const commandName = `7d${file.replace('.js', '')}`;
            const command = commands.get(commandName);
            
            if (command) {
              const commandInfo = {
                name: command.data.name,
                description: command.data.description
              };
              
              if (folder === 'admin') {
                adminCommands.push(commandInfo);
              } else {
                utilityCommands.push(commandInfo);
              }
            }
          }
        }
      }
      
      // Sort commands alphabetically
      adminCommands.sort((a, b) => a.name.localeCompare(b.name));
      utilityCommands.sort((a, b) => a.name.localeCompare(b.name));
      
      // Group commands by category
      const commandGroups = {
        server: [],
        player: [],
        registration: []
      };
      
      const adminGroups = {
        moderation: [],
        management: [],
        server: []
      };
      
      // Categorize utility commands
      for (const cmd of utilityCommands) {
        if (cmd.name.includes('info') || cmd.name.includes('version') || cmd.name.includes('time') || cmd.name.includes('weather') || cmd.name.includes('help')) {
          commandGroups.server.push(cmd);
        } else if (cmd.name.includes('player')) {
          commandGroups.player.push(cmd);
        } else if (cmd.name.includes('register')) {
          commandGroups.registration.push(cmd);
        } else {
          commandGroups.server.push(cmd); // Default fallback
        }
      }
      
      // Categorize admin commands
      for (const cmd of adminCommands) {
        if (cmd.name.includes('ban') || cmd.name.includes('kick') || cmd.name.includes('unban') || cmd.name.includes('kill') || cmd.name.includes('whitelist')) {
          adminGroups.moderation.push(cmd);
        } else if (cmd.name.includes('give') || cmd.name.includes('teleport') || cmd.name.includes('exec') || cmd.name.includes('spawn')) {
          adminGroups.management.push(cmd);
        } else if (cmd.name.includes('ai') || cmd.name.includes('weathercontrol')) {
          adminGroups.server.push(cmd);
        } else {
          adminGroups.server.push(cmd);
        }
      }
      
      // Build the main embed (public commands)
      const embed = {
        color: 0x00ff00, // Green color
        title: '🎮 7 Days to Die Discord Bot',
        description: 'Here are all the public commands available to everyone:',
        fields: [],
        footer: {
          text: 'Use /7dregister <code> with a code from in-game !register to link your account'
        },
        timestamp: new Date().toISOString()
      };
      
      // Add each command as its own field in 2-column layout
      const allPublicCommands = [...commandGroups.server, ...commandGroups.player, ...commandGroups.registration];
      
      for (let i = 0; i < allPublicCommands.length; i++) {
        const cmd = allPublicCommands[i];
        let emoji = '🖥️'; // Default
        
        // Assign emojis based on command type
        if (cmd.name.includes('info')) emoji = 'ℹ️';
        else if (cmd.name.includes('help')) emoji = '❓';
        else if (cmd.name.includes('time')) emoji = '🕐';
        else if (cmd.name.includes('weather')) emoji = '🌤️';
        else if (cmd.name.includes('version')) emoji = '📋';
        else if (cmd.name.includes('players')) emoji = '👥';
        else if (cmd.name.includes('playerinfo')) emoji = '👤';
        else if (cmd.name.includes('register')) emoji = '🔗';
        
        embed.fields.push({
          name: `${emoji} ${cmd.name}`,
          value: cmd.description,
          inline: true
        });
      }
      
      // Add footer information
      let additionalInfo = '• Some commands require Discord registration\n';
      additionalInfo += '• Type commands in any channel where the bot is present\n';
      
      if (isAdmin) {
        additionalInfo += '• Admin commands will be shown in a separate message';
      } else {
        additionalInfo += '• Admin commands are hidden from non-administrators';
      }
      
      embed.fields.push({
        name: 'ℹ️ Additional Information',
        value: additionalInfo,
        inline: false
      });
      
      // Send the main embed
      await interaction.editReply({ embeds: [embed] });
      
      // Send admin commands in a separate embed if user is admin
      if (isAdmin && adminCommands.length > 0) {
        const adminEmbed = {
          color: 0xff6600, // Orange color for admin
          title: '🛡️ Administrator Commands',
          description: 'Advanced commands for server administrators:',
          fields: [],
          footer: {
            text: 'These commands are only visible to administrators'
          },
          timestamp: new Date().toISOString()
        };
        
        // Add each admin command as its own field in 2-column layout
        const allAdminCommands = [...adminGroups.moderation, ...adminGroups.management, ...adminGroups.server];
        
        for (let i = 0; i < allAdminCommands.length; i++) {
          const cmd = allAdminCommands[i];
          let emoji = '🛡️'; // Default
          
          // Assign emojis based on command type
          if (cmd.name.includes('ban') && !cmd.name.includes('unban')) emoji = '🔨';
          else if (cmd.name.includes('unban')) emoji = '🔓';
          else if (cmd.name.includes('kick')) emoji = '👢';
          else if (cmd.name.includes('banlist')) emoji = '📋';
          else if (cmd.name.includes('give')) emoji = '🎁';
          else if (cmd.name.includes('teleport')) emoji = '🌀';
          else if (cmd.name.includes('exec')) emoji = '⚡';
          else if (cmd.name.includes('saveworld')) emoji = '💾';
          else if (cmd.name.includes('walkersim')) emoji = '🧟';
          else if (cmd.name.includes('setchannel')) emoji = '📺';
          else if (cmd.name.includes('ai')) emoji = '🤖';
          else if (cmd.name.includes('status')) emoji = '🎭';
          else if (cmd.name.includes('whitelist')) emoji = '🔒';
          else if (cmd.name.includes('kill')) emoji = '💀';
          else if (cmd.name.includes('spawn')) emoji = '🧟';
          else if (cmd.name.includes('weathercontrol')) emoji = '🌤️';
          
          adminEmbed.fields.push({
            name: `${emoji} ${cmd.name}`,
            value: cmd.description,
            inline: true
          });
        }
        
        // Add admin information
        adminEmbed.fields.push({
          name: '⚠️ Important Notes',
          value: '• All admin commands are ephemeral (only you can see responses)\n• Commands require Administrator permission or configured admin role\n• All admin actions are logged to console for audit purposes',
          inline: false
        });
        
        await interaction.followUp({ embeds: [adminEmbed], ephemeral: true });
      }
      
    } catch (err) {
      console.error(`Error in help command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error displaying help: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error displaying help: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 