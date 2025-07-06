const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dban')
    .setDescription('Bans a player from the game server.')
    .addStringOption(option =>
      option.setName('player')
        .setDescription('The name of the player to ban.')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the ban.')
            .setRequired(false)),
  async execute(interaction, { telnet, config }) {
    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const playerName = interaction.options.getString('player');
    const reason = interaction.options.getString('reason') || 'Banned by bot command.';
    const command = `ban add "${playerName}" 0 years "${reason}"`;

    try {
        await interaction.deferReply({ ephemeral: true });
        const response = await telnet.exec(command);
        await interaction.editReply({ content: `Ban command sent for player: \`${playerName}\` for reason: \`${reason}\`. Server response: \`\`\`${response}\`\`\`` });
    } catch (err) {
        console.error(`Error executing ban command: ${err}`);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `Failed to execute ban command. See console for details.` });
        } else {
            await interaction.reply({ content: `Failed to execute ban command. See console for details.`, ephemeral: true });
        }
    }
  },
}; 