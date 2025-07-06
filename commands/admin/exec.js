const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dexec')
    .setDescription('Executes a raw command on the telnet server.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to execute.')
        .setRequired(true)),
  async execute(interaction, { telnet, config }) {
    if (!config["allow-exec-command"]) {
        return interaction.reply({ content: 'This command is disabled.', ephemeral: true });
    }

    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const command = interaction.options.getString('command');
    
    console.log("User " + interaction.user.tag + " (" + interaction.user.id + ") executed command: /exec " + command);
    telnet.exec(command);
    await interaction.reply({ content: `Executing: \`${command}\``, ephemeral: true });
  },
}; 