const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dwalkersim')
    .setDescription('Shows walker simulation statistics and information.'),
  async execute(interaction, { telnet, handleCmdError, config }) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      if (!config['admin-role-id'] || !interaction.member.roles.cache.has(config['admin-role-id'])) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      telnet.exec('walkersim stats', (err, response) => {
        if (err) {
          console.error('Error getting walker sim stats:', err);
          handleCmdError(err);
          return interaction.editReply({ content: `Error getting walker sim stats: ${err.message}` });
        }
        
        if (!response || response.trim() === '') {
          return interaction.editReply({ content: 'No walker simulation data available or empty response from server.' });
        }
        
        // Parse and clean the response
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
          return interaction.editReply({ content: 'No walker simulation statistics available.' });
        }
        
        // Format the response as a simple list
        let formattedResponse = '**🧟 Walker Simulation Statistics:**\n';
        
        if (lines.length === 0) {
          formattedResponse += '*No walker simulation data available.*';
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
            formattedResponse = '**🧟 Walker Simulation Statistics:**\n```\n';
            for (const line of lines.slice(0, 20)) { // Show first 20 entries
              if (line.trim() !== '') {
                formattedResponse += line.trim() + '\n';
              }
            }
            if (lines.length > 20) {
              formattedResponse += `\n... and ${lines.length - 20} more entries\n`;
            }
            formattedResponse += '```';
          }
        }
        
        console.log(`[DEBUG] Walker sim stats command executed`);
        interaction.editReply({ content: formattedResponse });
      });
      
    } catch (err) {
      console.error(`Error in walkersim command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error getting walker sim stats: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error getting walker sim stats: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 