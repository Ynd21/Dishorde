const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dstatusrotate')
        .setDescription('Toggle status rotation on/off')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Enable or disable status rotation')
                .setRequired(false)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' },
                    { name: 'Status', value: 'status' }
                )),
    
    async execute(interaction, { config }) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
        }

        const action = interaction.options.getString('action');
        
        if (!action || action === 'status') {
            // Show current status
            const currentStatus = global.statusRotation?.enabled ? '✅ Enabled' : '❌ Disabled';
            const rotationInterval = '5 minutes';
            const playerUpdateInterval = '15 minutes';
            
            return interaction.reply({
                embeds: [{
                    title: '🔄 Status Rotation Settings',
                    fields: [
                        { name: 'Rotation Status', value: currentStatus, inline: true },
                        { name: 'Rotation Interval', value: rotationInterval, inline: true },
                        { name: 'Player Count Update', value: playerUpdateInterval, inline: true },
                        { name: 'Current Statuses', value: global.statusRotation?.getCustomStatuses().map(s => `• ${s.text}`).join('\n') || 'Not available', inline: false }
                    ],
                    color: global.statusRotation?.enabled ? 0x00ff00 : 0xff0000,
                    timestamp: new Date()
                }],
                ephemeral: true
            });
        }

        if (action === 'enable') {
            if (global.statusRotation) {
                if (global.statusRotation.enabled) {
                    return interaction.reply({ content: '🔄 Status rotation is already enabled!', ephemeral: true });
                }
                global.statusRotation.enabled = true;
                return interaction.reply({ 
                    content: '🔄 ✅ Status rotation has been **enabled**! The bot will now cycle through different statuses every 5 minutes.', 
                    ephemeral: true 
                });
            } else {
                return interaction.reply({ content: '❌ Status rotation system not available.', ephemeral: true });
            }
        }

        if (action === 'disable') {
            if (global.statusRotation) {
                if (!global.statusRotation.enabled) {
                    return interaction.reply({ content: '🔄 Status rotation is already disabled!', ephemeral: true });
                }
                global.statusRotation.enabled = false;
                return interaction.reply({ 
                    content: '🔄 ❌ Status rotation has been **disabled**! The bot will use a static status.', 
                    ephemeral: true 
                });
            } else {
                return interaction.reply({ content: '❌ Status rotation system not available.', ephemeral: true });
            }
        }
    },
}; 