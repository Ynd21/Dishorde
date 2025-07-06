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
    .setName('7dteleport')
    .setDescription('Teleport a player to coordinates or to another player.')
    .addStringOption(option =>
      option.setName('player')
        .setDescription('The player to teleport.')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('target')
        .setDescription('Target player name OR coordinates (x,y,z format like: 100,50,200)')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption(option =>
      option.setName('y')
        .setDescription('Y coordinate (only if using separate coordinates)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('z')
        .setDescription('Z coordinate (only if using separate coordinates)')
        .setRequired(false)),
  async execute(interaction, { telnet, config }) {
    const member = interaction.member;
    const hasAdminPerm = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    const hasAdminRole = config.adminRoleId && member.roles.cache.has(config.adminRoleId);

    if (!hasAdminPerm && !hasAdminRole) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const playerName = interaction.options.getString('player');
    const target = interaction.options.getString('target');
    const yCoord = interaction.options.getString('y');
    const zCoord = interaction.options.getString('z');

    try {
        await interaction.deferReply({ ephemeral: true });
        
        let command;
        
        // Check if target contains coordinates (has commas) or if y/z are provided
        if (target.includes(',') || (yCoord && zCoord)) {
            // Teleport to coordinates
            let x, y, z;
            
            if (target.includes(',')) {
                // Parse x,y,z format
                const coords = target.split(',').map(c => c.trim());
                if (coords.length !== 3) {
                    return interaction.editReply({ content: 'Invalid coordinate format. Use: x,y,z (example: 100,50,200)' });
                }
                [x, y, z] = coords;
            } else {
                // Use separate parameters
                x = target;
                y = yCoord;
                z = zCoord;
            }
            
            command = `teleportplayer "${playerName}" ${x} ${y} ${z}`;
            console.log(`[ADMIN] ${interaction.user.tag} teleporting ${playerName} to coordinates ${x},${y},${z}`);
        } else {
            // Teleport to another player
            command = `teleportplayer "${playerName}" "${target}"`;
            console.log(`[ADMIN] ${interaction.user.tag} teleporting ${playerName} to player ${target}`);
        }

        const response = await telnet.exec(command);
        await interaction.editReply({ 
            content: `Teleport command executed for ${playerName}.\n\`\`\`${response || 'Command sent successfully'}\`\`\`` 
        });
        
    } catch (err) {
        console.error(`Error executing teleport command: ${err}`);
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: `Failed to execute teleport command: ${err.message}` });
        } else {
            await interaction.reply({ content: `Failed to execute teleport command: ${err.message}`, ephemeral: true });
        }
    }
  },
}; 