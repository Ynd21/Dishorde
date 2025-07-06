const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dsetchannel')
    .setDescription('Sets the channel for the bot.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to set.')
        .setRequired(true)),
  async execute(interaction, { client, config, configFile, refreshDiscordStatus }) {
    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const channelobj = interaction.options.getChannel('channel');

    if (channelobj.type !== 'GUILD_TEXT') {
        return interaction.reply({ content: 'Please select a text channel.', ephemeral: true });
    }

    if(config.channel === channelobj.id) {
      interaction.reply({ content: `:warning: This channel is already set as the bot's active channel!`, ephemeral: true });
      return;
    }

    config.channel = channelobj.id;

    fs.writeFile(configFile, JSON.stringify(config, null, "\t"), "utf8", (err) => {
      if(err) {
        console.error("Failed to write to the config file with the following err:\n" + err + "\nMake sure your config file is not read-only or missing.");
        interaction.reply({ content: `:warning: Channel set successfully to <#${channelobj.id}> (${channelobj.id}), however the configuration has failed to save. The configured channel will not save when the bot restarts. See the bot's console for more info.`, ephemeral: true });
      }
      else {
        interaction.reply({ content: `:white_check_mark: The channel has been successfully set to <#${channelobj.id}> (${channelobj.id})`, ephemeral: true });
      }
    });
    
    client.channels.fetch(channelobj.id).then(channel => {
        global.channel = channel;
    });
    
    refreshDiscordStatus();
  },
}; 