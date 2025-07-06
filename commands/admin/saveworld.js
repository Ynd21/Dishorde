const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dsaveworld')
    .setDescription('Saves the world to disk.'),
  async execute(interaction, { telnet, handleCmdError, config }) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      if (!config['admin-role-id'] || !interaction.member.roles.cache.has(config['admin-role-id'])) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      const command = 'saveworld sa';
      console.log(`[DEBUG] Executing save world command: ${command}`);
      
      telnet.exec(command, (err, response) => {
        if (err) {
          console.error('Error saving world:', err);
          handleCmdError(err);
          return interaction.editReply({ content: `Error saving world: ${err.message}` });
        }
        
        // Parse and clean the response
        const lines = response ? response.split(/\n|\r/g).filter(line => {
          const trimmed = line.trim();
          return trimmed !== '' && 
                 !trimmed.includes('ERR') && 
                 !trimmed.includes('EXC') && 
                 !trimmed.includes('Unable to write') &&
                 !trimmed.includes('socket has been shut down') &&
                 !trimmed.includes('Telnet connection closed') &&
                 !trimmed.includes('Exited thread');
        }) : [];
        
        let message = '✅ **World Save Initiated**\n\nThe server is saving the world to disk.';
        
        if (lines.length > 0) {
          // Include relevant server response if available
          const cleanResponse = lines.join('\n').trim();
          if (cleanResponse) {
            message += `\n\n**Server Response:**\n\`\`\`\n${cleanResponse}\n\`\`\``;
          }
        }
        
        console.log(`[DEBUG] Save world command executed successfully`);
        interaction.editReply({ content: message });
      });
      
    } catch (err) {
      console.error(`Error in saveworld command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error saving world: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error saving world: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 