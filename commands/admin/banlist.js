const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dbanlist')
    .setDescription('Shows a list of all banned players with their duration, ID, and reason.'),
  async execute(interaction, { telnet, handleCmdError, config }) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      if (!config['admin-role-id'] || !interaction.member.roles.cache.has(config['admin-role-id'])) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      telnet.exec('ban list', (err, response) => {
        if (err) {
          console.error('Error getting ban list:', err);
          handleCmdError(err);
          return interaction.editReply({ content: `Error getting ban list: ${err.message}` });
        }
        
        if (!response || response.trim() === '') {
          return interaction.editReply({ content: 'No banned players found or empty response from server.' });
        }
        
        // Parse the ban list response and filter out error messages
        const lines = response.split(/\n|\r/g).filter(line => {
          const trimmed = line.trim();
          return trimmed !== '' && 
                 !trimmed.includes('ERR') && 
                 !trimmed.includes('EXC') && 
                 !trimmed.includes('Unable to write') &&
                 !trimmed.includes('socket has been shut down') &&
                 !trimmed.includes('Telnet connection closed') &&
                 !trimmed.includes('Exited thread');
        });
        
        if (lines.length === 0) {
          return interaction.editReply({ content: 'No banned players found.' });
        }
        
        // Format the response as a simple list
        let formattedResponse = '**🚫 Banned Players:**\n';
        
        if (lines.length === 0) {
          formattedResponse += '*No banned players found.*';
        } else {
          formattedResponse += '```\n';
          for (const line of lines) {
            if (line.trim() !== '') {
              formattedResponse += line.trim() + '\n';
            }
          }
          formattedResponse += '```';
          
          // Discord has a 2000 character limit for messages
          if (formattedResponse.length > 2000) {
            // Fallback to simpler format if too long
            formattedResponse = '**🚫 Banned Players:**\n```\n';
            for (const line of lines.slice(0, 15)) { // Show first 15 entries
              if (line.trim() !== '') {
                formattedResponse += line.trim() + '\n';
              }
            }
            if (lines.length > 15) {
              formattedResponse += `\n... and ${lines.length - 15} more entries\n`;
            }
            formattedResponse += '```';
          }
        }
        
        interaction.editReply({ content: formattedResponse });
      });
      
    } catch (err) {
      console.error(`Error in banlist command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error getting ban list: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error getting ban list: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 