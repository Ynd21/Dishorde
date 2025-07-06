const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dgive')
    .setDescription('Give items to a player.')
    .addStringOption(option =>
      option.setName('player')
        .setDescription('The player to give items to.')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item name to give (e.g., ironIngot, concrete, ak47)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Number of items to give (default: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10000))
    .addIntegerOption(option =>
      option.setName('quality')
        .setDescription('Quality level of the item (1-6, default: 6)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(6)),
  async execute(interaction, { telnet, config }) {
    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const playerName = interaction.options.getString('player');
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;
    const quality = interaction.options.getInteger('quality') || 6;

    try {
        await interaction.deferReply({ ephemeral: true });
        
        // First, get the player list to find the entity ID
        const lpResponse = await telnet.exec('lp');
        const lines = lpResponse.split(/\n|\r/g);
        const playerRegex = /^\d+\. id=(\d+), (.+?), pos=/;
        
        let entityId = null;
        for (const line of lines) {
            const match = line.match(playerRegex);
            if (match && match[2] === playerName) {
                entityId = match[1];
                break;
            }
        }
        
        if (!entityId) {
            return interaction.editReply({ content: `Player "${playerName}" not found online.` });
        }
        
        // Execute the give command
        const command = `give ${entityId} ${itemName} ${quantity} ${quality}`;
        console.log(`[ADMIN] ${interaction.user.tag} giving ${quantity}x ${itemName} (quality ${quality}) to ${playerName} (ID: ${entityId})`);
        
        const response = await telnet.exec(command);
        await interaction.editReply({ 
            content: `Given ${quantity}x ${itemName} (quality ${quality}) to ${playerName}.\n\`\`\`${response || 'Command sent successfully'}\`\`\`` 
        });
        
    } catch (err) {
        console.error(`Error executing give command: ${err}`);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `Failed to execute give command: ${err.message}` });
        } else {
            await interaction.reply({ content: `Failed to execute give command: ${err.message}`, ephemeral: true });
        }
    }
  },
}; 