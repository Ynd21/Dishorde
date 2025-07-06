const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dspawn')
        .setDescription('Spawn entities, airdrops, or supply crates')
        .addSubcommand(subcommand =>
            subcommand
                .setName('entity')
                .setDescription('Spawn an entity (zombie, animal, etc.)')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Entity type to spawn')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Zombie Dog', value: 'zombieDog' },
                            { name: 'Zombie Spider', value: 'zombieSpider' },
                            { name: 'Zombie Bear', value: 'zombieBear' },
                            { name: 'Zombie Vulture', value: 'zombieVulture' },
                            { name: 'Screamer', value: 'zombieScreamer' },
                            { name: 'Feral Zombie', value: 'zombieFeral' },
                            { name: 'Radiated Zombie', value: 'zombieRadiated' },
                            { name: 'Deer', value: 'animalDeer' },
                            { name: 'Rabbit', value: 'animalRabbit' },
                            { name: 'Chicken', value: 'animalChicken' },
                            { name: 'Pig', value: 'animalPig' },
                            { name: 'Bear', value: 'animalBear' },
                            { name: 'Wolf', value: 'animalWolf' }
                        ))
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('Player to spawn near (optional)')
                        .setRequired(false)
                        .setAutocomplete(true))
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number to spawn (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('airdrop')
                .setDescription('Spawn an airdrop')
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('Player to spawn near (optional)')
                        .setRequired(false)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('supplycrate')
                .setDescription('Spawn a supply crate')
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('Player to spawn near (optional)')
                        .setRequired(false)
                        .setAutocomplete(true))),

    async execute(interaction, context) {
        const { telnet, handleCmdError } = context;
        
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const player = interaction.options.getString('player');
        
        await interaction.deferReply({ ephemeral: true });

        let command;
        let description;
        let emoji;

        try {
            switch (subcommand) {
                case 'entity':
                    const entityType = interaction.options.getString('type');
                    const count = interaction.options.getInteger('count') || 1;
                    
                    if (player) {
                        // Spawn near player
                        command = `spawnentity ${player} ${entityType} ${count}`;
                        description = `Spawned **${count}x ${entityType}** near **${player}**`;
                    } else {
                        // Spawn at random location
                        command = `spawnentity ${entityType} ${count}`;
                        description = `Spawned **${count}x ${entityType}** at random location`;
                    }
                    emoji = '🧟';
                    break;
                    
                case 'airdrop':
                    if (player) {
                        // Get player position first, then spawn airdrop
                        const playerPos = await telnet.exec(`teleportplayer ${player} ${player}`);
                        command = 'spawnairdrop';
                    } else {
                        command = 'spawnairdrop';
                    }
                    description = player ? `Spawned **airdrop** near **${player}**` : 'Spawned **airdrop** at random location';
                    emoji = '📦';
                    break;
                    
                case 'supplycrate':
                    if (player) {
                        command = `spawnsupplycrate ${player}`;
                        description = `Spawned **supply crate** near **${player}**`;
                    } else {
                        command = 'spawnsupplycrate';
                        description = 'Spawned **supply crate** at random location';
                    }
                    emoji = '🎁';
                    break;
            }

            const response = await telnet.exec(command);
            
            const embed = new EmbedBuilder()
                .setTitle(`${emoji} Spawn Command Executed`)
                .setDescription(description)
                .setColor(0x00AE86)
                .setTimestamp();

            if (response && response.trim()) {
                embed.addFields({
                    name: 'Server Response',
                    value: `\`\`\`${response.substring(0, 1000)}\`\`\``,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
            
            // Send notification to game channel
            if (interaction.guild.channels.cache.get(context.config.channel)) {
                const publicChannel = interaction.guild.channels.cache.get(context.config.channel);
                publicChannel.send(`${emoji} **Admin Event:** ${description}`);
            }
        } catch (err) {
            console.error('Spawn command error:', err);
            const embed = new EmbedBuilder()
                .setTitle('❌ Spawn Command Error')
                .setDescription(`Failed to execute spawn command: ${err.message}`)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};