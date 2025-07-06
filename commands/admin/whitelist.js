const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dwhitelist')
        .setDescription('Manage server whitelist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a player to the whitelist')
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('Player name or Steam ID to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a player from the whitelist')
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('Player name or Steam ID to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all whitelisted players'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable whitelist mode'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable whitelist mode')),

    async execute(interaction, context) {
        const { telnet, handleCmdError } = context;
        
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const player = interaction.options.getString('player');

        let command;
        let successMessage;

        switch (subcommand) {
            case 'add':
                command = `whitelist add ${player}`;
                successMessage = `Added **${player}** to the whitelist.`;
                break;
            case 'remove':
                command = `whitelist remove ${player}`;
                successMessage = `Removed **${player}** from the whitelist.`;
                break;
            case 'list':
                command = 'whitelist list';
                break;
            case 'enable':
                command = 'whitelist enable';
                successMessage = 'Whitelist mode **enabled**. Only whitelisted players can join.';
                break;
            case 'disable':
                command = 'whitelist disable';
                successMessage = 'Whitelist mode **disabled**. All players can join.';
                break;
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await telnet.exec(command);
            
            if (subcommand === 'list') {
                // Parse whitelist response
                const embed = new EmbedBuilder()
                    .setTitle('🔒 Server Whitelist')
                    .setColor(0x00AE86)
                    .setTimestamp();

                if (response && response.trim()) {
                    const lines = response.split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        embed.setDescription(lines.join('\n') || 'No players in whitelist');
                    } else {
                        embed.setDescription('No players in whitelist');
                    }
                } else {
                    embed.setDescription('No players in whitelist');
                }

                await interaction.editReply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('🔒 Whitelist Management')
                    .setDescription(successMessage)
                    .setColor(0x00AE86)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }
        } catch (err) {
            console.error('Whitelist command error:', err);
            const embed = new EmbedBuilder()
                .setTitle('❌ Whitelist Error')
                .setDescription(`Failed to execute whitelist command: ${err.message}`)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
}; 