const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dkick')
    .setDescription('Kicks a player from the game server.')
    .addStringOption(option =>
      option.setName('player')
        .setDescription('The name of the player to kick.')
        .setRequired(true)
        .setAutocomplete(true)),
  async execute(interaction, { telnet, config }) {
    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const playerName = interaction.options.getString('player');
    const command = `kick "${playerName}"`;

    try {
        await interaction.deferReply({ ephemeral: true });
        const response = await telnet.exec(command);
        await interaction.editReply({ content: `Kick command sent for player: \`${playerName}\`. Server response: \`\`\`${response}\`\`\`` });
    } catch (err) {
        console.error(`Error executing kick command: ${err}`);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `Failed to execute kick command. See console for details.` });
        } else {
            await interaction.reply({ content: `Failed to execute kick command. See console for details.`, ephemeral: true });
        }
    }
  },
}; 