const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dkill')
        .setDescription('Kill a player')
        .addStringOption(option =>
            option.setName('player')
                .setDescription('Player to kill')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction, context) {
        const { telnet, handleCmdError } = context;
        
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const playerName = interaction.options.getString('player');

        await interaction.deferReply({ ephemeral: true });

        try {
            const response = await telnet.exec(`kill ${playerName}`);
            
            const embed = new EmbedBuilder()
                .setTitle('💀 Player Killed')
                .setDescription(`**${playerName}** has been eliminated.`)
                .setColor(0xFF4444)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            
            // Also send a public notification to the game channel
            if (interaction.guild.channels.cache.get(context.config.channel)) {
                const publicChannel = interaction.guild.channels.cache.get(context.config.channel);
                publicChannel.send(`💀 **${playerName}** was eliminated by an admin.`);
            }
        } catch (err) {
            console.error('Kill command error:', err);
            const embed = new EmbedBuilder()
                .setTitle('❌ Kill Command Error')
                .setDescription(`Failed to kill player: ${err.message}`)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
}; 