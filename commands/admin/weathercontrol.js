const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dweathercontrol')
        .setDescription('Control and view weather conditions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View current weather conditions'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set weather conditions')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Weather type to set')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Clear Skies', value: 'clear' },
                            { name: 'Light Rain', value: 'rain 0.3' },
                            { name: 'Heavy Rain', value: 'rain 0.8' },
                            { name: 'Light Snow', value: 'snow 0.3' },
                            { name: 'Heavy Snow', value: 'snow 0.8' },
                            { name: 'Foggy', value: 'fog 0.7' },
                            { name: 'Stormy', value: 'storm' },
                            { name: 'Sandstorm', value: 'sandstorm' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('temperature')
                .setDescription('Set temperature')
                .addIntegerOption(option =>
                    option.setName('degrees')
                        .setDescription('Temperature in Fahrenheit (-40 to 120)')
                        .setRequired(true)
                        .setMinValue(-40)
                        .setMaxValue(120)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('wind')
                .setDescription('Set wind speed')
                .addNumberOption(option =>
                    option.setName('speed')
                        .setDescription('Wind speed (0.0 to 20.0)')
                        .setRequired(true)
                        .setMinValue(0.0)
                        .setMaxValue(20.0))),

    async execute(interaction, context) {
        const { telnet, handleCmdError } = context;
        
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        
        await interaction.deferReply({ ephemeral: true });

        try {
            if (subcommand === 'status') {
                // Get current weather status
                const response = await telnet.exec('weather');
                const embed = this.parseWeatherData(response);
                await interaction.editReply({ embeds: [embed] });
            } else {
                // Set weather conditions
                let command;
                let description;

                switch (subcommand) {
                    case 'set':
                        const weatherType = interaction.options.getString('type');
                        command = `weather ${weatherType}`;
                        description = `Set weather to **${weatherType}**`;
                        break;
                    case 'temperature':
                        const temp = interaction.options.getInteger('degrees');
                        command = `weather temp ${temp}`;
                        description = `Set temperature to **${temp}°F**`;
                        break;
                    case 'wind':
                        const windSpeed = interaction.options.getNumber('speed');
                        command = `weather wind ${windSpeed}`;
                        description = `Set wind speed to **${windSpeed}**`;
                        break;
                }

                const response = await telnet.exec(command);
                
                const embed = {
                    title: '🌤️ Weather Control',
                    description: description,
                    color: 0x87CEEB,
                    timestamp: new Date().toISOString(),
                    fields: []
                };

                if (response && response.trim()) {
                    embed.fields.push({
                        name: 'Server Response',
                        value: `\`\`\`${response.substring(0, 500)}\`\`\``,
                        inline: false
                    });
                }

                await interaction.editReply({ embeds: [embed] });
                
                // Send notification to game channel
                if (interaction.guild.channels.cache.get(context.config.channel)) {
                    const publicChannel = interaction.guild.channels.cache.get(context.config.channel);
                    publicChannel.send(`🌤️ **Weather Update:** ${description}`);
                }
            }
        } catch (err) {
            console.error('Weather command error:', err);
            const embed = {
                title: '❌ Weather Command Error',
                description: `Failed to execute weather command: ${err.message}`,
                color: 0xFF0000,
                timestamp: new Date().toISOString()
            };

            await interaction.editReply({ embeds: [embed] });
        }
    },

    parseWeatherData(rawData) {
        const embed = {
            title: '🌤️ Current Weather Conditions',
            color: 0x87CEEB,
            timestamp: new Date().toISOString(),
            fields: []
        };

        if (!rawData || rawData.trim() === '') {
            embed.description = 'Unable to retrieve weather data.';
            return embed;
        }

        // If we don't get the expected format, show the raw data
        if (!rawData.includes('WeatherManager') && !rawData.includes('Temperature')) {
            embed.description = '🌤️ **Current Weather Status**';
            embed.fields.push({
                name: 'Server Response',
                value: `\`\`\`${rawData.substring(0, 1000)}\`\`\``,
                inline: false
            });
            return embed;
        }

        try {
            const lines = rawData.split('\n');
            const biomes = [];
            let globalWeather = {};

            for (const line of lines) {
                if (line.includes(':') && (line.includes('Temperature') || line.includes('Precipitation'))) {
                    // Parse biome-specific weather
                    const biomeMatch = line.match(/^(\w+):/);
                    if (biomeMatch) {
                        const biomeName = biomeMatch[1].replace('_', ' ').toUpperCase();
                        const tempMatch = line.match(/Temperature ([\d.]+)/);
                        const precipMatch = line.match(/Precipitation ([\d.]+)/);
                        const windMatch = line.match(/Wind ([\d.]+)/);
                        const rainMatch = line.match(/rain ([\d.]+)/);
                        const snowMatch = line.match(/snow ([\d.]+)/);

                        if (tempMatch) {
                            const temp = parseFloat(tempMatch[1]);
                            const precipitation = precipMatch ? parseFloat(precipMatch[1]) : 0;
                            const wind = windMatch ? parseFloat(windMatch[1]) : 0;
                            const rain = rainMatch ? parseFloat(rainMatch[1]) : 0;
                            const snow = snowMatch ? parseFloat(snowMatch[1]) : 0;

                            let conditions = [];
                            if (rain > 0.1) conditions.push(`🌧️ Rain (${(rain * 100).toFixed(0)}%)`);
                            if (snow > 0.1) conditions.push(`❄️ Snow (${(snow * 100).toFixed(0)}%)`);
                            if (conditions.length === 0) conditions.push('☀️ Clear');

                            biomes.push({
                                name: biomeName,
                                temp: temp.toFixed(1),
                                wind: wind.toFixed(1),
                                conditions: conditions.join(', ')
                            });
                        }
                    }
                }
                
                // Parse global weather values
                if (line.startsWith('Temperature ')) {
                    globalWeather.temp = line.match(/Temperature ([\d.-]+)/)?.[1] || '0';
                }
                if (line.startsWith('Rain ')) {
                    globalWeather.rain = line.match(/Rain ([\d.]+)/)?.[1] || '0';
                }
                if (line.startsWith('Snowfall ')) {
                    globalWeather.snow = line.match(/Snowfall ([\d.]+)/)?.[1] || '0';
                }
                if (line.startsWith('Wind ')) {
                    globalWeather.wind = line.match(/Wind ([\d.]+)/)?.[1] || '0';
                }
            }

            // Add global weather summary
            let globalConditions = [];
            if (parseFloat(globalWeather.rain || 0) > 0) globalConditions.push(`🌧️ Rain`);
            if (parseFloat(globalWeather.snow || 0) > 0) globalConditions.push(`❄️ Snow`);
            if (globalConditions.length === 0) globalConditions.push('☀️ Clear');

            embed.fields.push({
                name: '🌍 Global Weather',
                value: `**Conditions:** ${globalConditions.join(', ')}\n**Temperature:** ${globalWeather.temp || 'N/A'}°F\n**Wind:** ${globalWeather.wind || 'N/A'} mph`,
                inline: false
            });

            // Add biome-specific weather (limit to 3 most interesting biomes)
            const interestingBiomes = biomes.slice(0, 3);
            if (interestingBiomes.length > 0) {
                for (const biome of interestingBiomes) {
                    embed.fields.push({
                        name: `🌿 ${biome.name}`,
                        value: `**${biome.conditions}**\n${biome.temp}°F, Wind: ${biome.wind}`,
                        inline: true
                    });
                }
            }

                                                 embed.fields.push({
                name: '💡 Weather Controls',
                value: 'Use `/7dweathercontrol set` to change weather conditions\nUse `/7dweathercontrol temperature` to set temperature\nUse `/7dweathercontrol wind` to control wind speed',
                inline: false
            });

        } catch (error) {
            console.error('Error parsing weather data:', error);
            embed.setDescription('Weather data received but could not be parsed properly.');
        }

        return embed;
    }
}; 