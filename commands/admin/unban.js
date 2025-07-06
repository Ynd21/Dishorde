const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dunban')
    .setDescription('Remove a ban from a player.')
    .addStringOption(option =>
      option.setName('identifier')
        .setDescription('Player name, entity ID, or Steam ID to unban')
        .setRequired(true)),
  async execute(interaction, { telnet, handleCmdError, config }) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      if (!config['admin-role-id'] || !interaction.member.roles.cache.has(config['admin-role-id'])) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }
    }

    const identifier = interaction.options.getString('identifier');

    try {
      await interaction.deferReply({ ephemeral: true });
      
      const command = `ban remove "${identifier}"`;
      console.log(`[DEBUG] Executing unban command: ${command}`);
      
      telnet.exec(command, (err, response) => {
        if (err) {
          console.error('Error removing ban:', err);
          handleCmdError(err);
          return interaction.editReply({ content: `Error removing ban: ${err.message}` });
        }
        
        // The response might be empty or contain confirmation
        let message = `Attempted to remove ban for: **${identifier}**`;
        
        if (response && response.trim() !== '') {
          // Include server response if available
          message += `\n\nServer response:\n\`\`\`\n${response.trim()}\n\`\`\``;
        }
        
        console.log(`[DEBUG] Unban command executed for ${identifier}`);
        interaction.editReply({ content: message });
      });
      
    } catch (err) {
      console.error(`Error in unban command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error removing ban: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error removing ban: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 