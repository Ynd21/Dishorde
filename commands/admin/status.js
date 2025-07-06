const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dstatus')
        .setDescription('Set bot status and activity type')
        .addStringOption(option =>
            option.setName('presence')
                .setDescription('Set bot presence status')
                .setRequired(false)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do Not Disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                ))
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('Set activity type for status rotation')
                .setRequired(false)
                .addChoices(
                    { name: 'Playing', value: 'playing' },
                    { name: 'Watching', value: 'watching' },
                    { name: 'Listening', value: 'listening' },
                    { name: 'Competing', value: 'competing' }
                ))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Set custom status text (disables rotation)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('next')
                .setDescription('Manually rotate to the next status in rotation')
                .setRequired(false)),
    
    async execute(interaction, { client }) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
        }

        const presence = interaction.options.getString('presence');
        const activity = interaction.options.getString('activity');
        const customText = interaction.options.getString('text');
        const nextStatus = interaction.options.getBoolean('next');
        
        // Handle manual status rotation
        if (nextStatus) {
            if (!global.statusRotation) {
                return interaction.reply({ content: '❌ Status rotation system is not available.', ephemeral: true });
            }
            
            if (!global.statusRotation.enabled) {
                return interaction.reply({ content: '❌ Status rotation is currently disabled. Use `/7dstatusrotate enable` first.', ephemeral: true });
            }
            
            // Get the next status and apply it
            const statusInfo = global.statusRotation.getNextStatus();
            client.user.setPresence({ 
                activities: [{ 
                    name: statusInfo.text, 
                    type: statusInfo.type 
                }],
                status: presence || client.user.presence.status || "online"
            });
            
            return interaction.reply({ 
                content: `🎭 Rotated to next status: **${getActivityTypeName(statusInfo.type)} ${statusInfo.text}**`, 
                ephemeral: true 
            });
        }
        
        if (!presence && !activity && !customText) {
            // Show current status
            const currentPresence = client.user.presence.status;
            const currentActivity = client.user.presence.activities[0];
            const activityType = currentActivity ? getActivityTypeName(currentActivity.type) : 'None';
            const activityText = currentActivity ? currentActivity.name : 'None';
            const rotationStatus = global.statusRotation?.enabled ? '✅ Enabled' : '❌ Disabled';
            
            return interaction.reply({
                embeds: [{
                    title: '🎭 Bot Status Settings',
                    fields: [
                        { name: 'Presence', value: currentPresence.charAt(0).toUpperCase() + currentPresence.slice(1), inline: true },
                        { name: 'Activity Type', value: activityType, inline: true },
                        { name: 'Status Rotation', value: rotationStatus, inline: true },
                        { name: 'Current Activity', value: activityText, inline: false }
                    ],
                    color: 0x0099ff,
                    timestamp: new Date()
                }],
                ephemeral: true
            });
        }

        let changes = [];
        
        // Set custom text (disables rotation)
        if (customText) {
            if (global.statusRotation) {
                global.statusRotation.enabled = false;
            }
            
            const activityType = activity ? getActivityTypeNumber(activity) : 0;
            client.user.setPresence({
                activities: [{ name: customText, type: activityType }],
                status: presence || client.user.presence.status
            });
            changes.push(`Custom status: "${customText}"`);
            changes.push('Status rotation: **disabled**');
        }
        
        // Set presence status
        if (presence) {
            client.user.setPresence({
                status: presence,
                activities: client.user.presence.activities
            });
            changes.push(`Presence: **${presence}**`);
        }
        
        // Set default activity type for rotation
        if (activity && !customText) {
            if (global.statusRotation) {
                global.statusRotation.defaultActivityType = getActivityTypeNumber(activity);
                changes.push(`Default activity type: **${activity}**`);
            }
        }
        
        if (changes.length === 0) {
            return interaction.reply({ content: 'No changes were made.', ephemeral: true });
        }
        
        return interaction.reply({ 
            content: `🎭 Bot status updated!\n\n${changes.join('\n')}`, 
            ephemeral: true 
        });
    },
};

function getActivityTypeName(type) {
    const types = {
        0: 'Playing',
        1: 'Streaming',
        2: 'Listening',
        3: 'Watching',
        5: 'Competing'
    };
    return types[type] || 'Unknown';
}

function getActivityTypeNumber(name) {
    const types = {
        'playing': 0,
        'streaming': 1,
        'listening': 2,
        'watching': 3,
        'competing': 5
    };
    return types[name] || 0;
} 