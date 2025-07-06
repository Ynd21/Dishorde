const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dweather')
    .setDescription('Shows current weather information across all biomes.'),
  
  async execute(interaction, { telnet, handleCmdError }) {
    try {
      await interaction.deferReply();
      
      const response = await telnet.exec('weather');
      
      if (response) {
        const embed = this.parseWeatherData(response);
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply('Unable to retrieve weather information.');
      }
      
    } catch (err) {
      console.error(`Error executing weather command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Failed to get weather information: ${err.message}` });
      } else {
          await interaction.reply({ content: `Failed to get weather information: ${err.message}`, ephemeral: true });
      }
    }
  },

  parseWeatherData(rawData) {
    const embed = {
      title: '🌍 World Weather Report',
      color: 0x87CEEB,
      timestamp: new Date().toISOString(),
      footer: { text: 'Weather updates every few minutes' },
      fields: []
    };

    if (!rawData || rawData.trim() === '') {
      embed.description = '❌ Unable to retrieve weather data from server.';
      return embed;
    }

    // If we don't get the expected format, show the raw data in a more readable way
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
      let globalWeather = {
        temp: '0',
        rain: '0',
        snow: '0',
        wind: '0',
        clouds: '0',
        fog: '0'
      };

      // Parse biome-specific weather
      for (const line of lines) {
        if (line.includes(':') && (line.includes('Temperature') || line.includes('Precipitation'))) {
          const biomeMatch = line.match(/^(\w+):/);
          if (biomeMatch) {
            const biomeName = biomeMatch[1];
            const tempMatch = line.match(/Temperature ([\d.]+)/);
            const precipMatch = line.match(/Precipitation ([\d.]+)/);
            const windMatch = line.match(/Wind ([\d.]+)/);
            const rainMatch = line.match(/rain ([\d.]+)/);
            const snowMatch = line.match(/snow ([\d.]+)/);
            const fogMatch = line.match(/Fog ([\d.]+)/);
            const cloudMatch = line.match(/CloudThickness ([\d.]+)/);

            if (tempMatch) {
              const temp = parseFloat(tempMatch[1]);
              const precipitation = precipMatch ? parseFloat(precipMatch[1]) : 0;
              const wind = windMatch ? parseFloat(windMatch[1]) : 0;
              const rain = rainMatch ? parseFloat(rainMatch[1]) : 0;
              const snow = snowMatch ? parseFloat(snowMatch[1]) : 0;
              const fog = fogMatch ? parseFloat(fogMatch[1]) : 0;
              const clouds = cloudMatch ? parseFloat(cloudMatch[1]) : 0;

              biomes.push({
                name: biomeName,
                temp: temp,
                wind: wind,
                rain: rain,
                snow: snow,
                fog: fog,
                clouds: clouds,
                precipitation: precipitation
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
        if (line.startsWith('Clouds ')) {
          globalWeather.clouds = line.match(/Clouds ([\d.]+)/)?.[1] || '0';
        }
        if (line.startsWith('Fog density ')) {
          globalWeather.fog = line.match(/Fog density ([\d.]+)/)?.[1] || '0';
        }
      }

      // Create global weather summary
      const globalRain = parseFloat(globalWeather.rain);
      const globalSnow = parseFloat(globalWeather.snow);
      const globalWind = parseFloat(globalWeather.wind);
      const globalClouds = parseFloat(globalWeather.clouds);
      const globalFog = parseFloat(globalWeather.fog);

      let globalConditions = [];
      let weatherEmoji = '☀️';

      if (globalRain > 0.1) {
        globalConditions.push(`🌧️ **Rain Active**`);
        weatherEmoji = '🌧️';
      }
      if (globalSnow > 0.1) {
        globalConditions.push(`❄️ **Snow Active**`);
        weatherEmoji = '❄️';
      }
      if (globalClouds > 50) {
        globalConditions.push(`☁️ **Cloudy** (${globalClouds.toFixed(0)}%)`);
        if (weatherEmoji === '☀️') weatherEmoji = '☁️';
      }
      if (globalFog > 0.1) {
        globalConditions.push(`🌫️ **Foggy**`);
      }
      if (globalWind > 10) {
        globalConditions.push(`💨 **Windy** (${globalWind.toFixed(1)} mph)`);
      }

      if (globalConditions.length === 0) {
        globalConditions.push('☀️ **Clear Skies**');
      }

      embed.description = `${weatherEmoji} **Current Conditions:** ${globalConditions.join(' • ')}`;

      // Add global weather stats
      let globalStats = '';
      if (globalWeather.temp !== '0') {
        globalStats += `🌡️ **Temperature:** ${globalWeather.temp}°F\n`;
      }
      if (globalWind > 0) {
        globalStats += `💨 **Wind:** ${globalWind.toFixed(1)} mph\n`;
      }
      if (globalRain > 0) {
        globalStats += `🌧️ **Rain Intensity:** ${(globalRain * 100).toFixed(0)}%\n`;
      }
      if (globalSnow > 0) {
        globalStats += `❄️ **Snow Intensity:** ${(globalSnow * 100).toFixed(0)}%\n`;
      }

      if (globalStats) {
        embed.fields.push({
          name: '🌍 Global Weather Stats',
          value: globalStats.trim(),
          inline: true
        });
      }

      // Add biome-specific weather (sorted by most interesting conditions)
      const sortedBiomes = biomes.sort((a, b) => {
        const aScore = (a.rain + a.snow + a.fog) * 100 + Math.abs(a.temp - 70);
        const bScore = (b.rain + b.snow + b.fog) * 100 + Math.abs(b.temp - 70);
        return bScore - aScore;
      });

      const maxBiomes = Math.min(6, sortedBiomes.length); // Show up to 6 biomes
      for (let i = 0; i < maxBiomes; i++) {
        const biome = sortedBiomes[i];
        const biomeName = this.getBiomeDisplayName(biome.name);
        const biomeEmoji = this.getBiomeEmoji(biome.name);
        
        let conditions = [];
        let conditionEmojis = [];

        // Weather conditions
        if (biome.rain > 0.1) {
          conditions.push(`Rain ${(biome.rain * 100).toFixed(0)}%`);
          conditionEmojis.push('🌧️');
        }
        if (biome.snow > 0.1) {
          conditions.push(`Snow ${(biome.snow * 100).toFixed(0)}%`);
          conditionEmojis.push('❄️');
        }
        if (biome.fog > 2) {
          conditions.push(`Foggy`);
          conditionEmojis.push('🌫️');
        }
        if (biome.clouds > 50) {
          conditions.push(`Cloudy ${biome.clouds.toFixed(0)}%`);
          conditionEmojis.push('☁️');
        }
        if (conditions.length === 0) {
          conditions.push('Clear');
          conditionEmojis.push('☀️');
        }

        // Temperature description
        let tempDesc = '';
        if (biome.temp < 32) tempDesc = '🥶 Freezing';
        else if (biome.temp < 50) tempDesc = '❄️ Cold';
        else if (biome.temp < 70) tempDesc = '😊 Cool';
        else if (biome.temp < 85) tempDesc = '🌡️ Warm';
        else if (biome.temp < 100) tempDesc = '🔥 Hot';
        else tempDesc = '🌋 Scorching';

        // Wind description
        let windDesc = '';
        if (biome.wind > 15) windDesc = '💨 Very Windy';
        else if (biome.wind > 10) windDesc = '🌪️ Windy';
        else if (biome.wind > 5) windDesc = '🍃 Breezy';
        else windDesc = '🌱 Calm';

        const fieldValue = `${conditionEmojis.join('')} **${conditions.join(', ')}**\n${tempDesc} (${biome.temp.toFixed(1)}°F)\n${windDesc} (${biome.wind.toFixed(1)} mph)`;

        embed.fields.push({
          name: `${biomeEmoji} ${biomeName}`,
          value: fieldValue,
          inline: true
        });
      }

      // Add helpful footer
      embed.fields.push({
        name: '💡 Weather Tips',
        value: '• **Rain/Snow** affects visibility and temperature\n• **Desert** biomes are hottest during day\n• **Snow** biomes are coldest and may have blizzards\n• **Wasteland** has unpredictable weather patterns',
        inline: false
      });

    } catch (error) {
      console.error('Error parsing weather data:', error);
      embed.description = '❌ Weather data received but could not be parsed properly.';
      embed.fields.push({
        name: '🔧 Raw Data',
        value: `\`\`\`${rawData.substring(0, 500)}...\`\`\``,
        inline: false
      });
    }

    return embed;
  },

  getBiomeDisplayName(biomeName) {
    const biomeNames = {
      'pine_forest': 'Pine Forest',
      'burnt_forest': 'Burnt Forest',
      'desert': 'Desert',
      'snow': 'Snow Biome',
      'wasteland': 'Wasteland',
      'plains': 'Plains',
      'forest': 'Forest'
    };
    return biomeNames[biomeName] || biomeName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  getBiomeEmoji(biomeName) {
    const biomeEmojis = {
      'pine_forest': '🌲',
      'burnt_forest': '🔥',
      'desert': '🏜️',
      'snow': '❄️',
      'wasteland': '☢️',
      'plains': '🌾',
      'forest': '🌳'
    };
    return biomeEmojis[biomeName] || '🌍';
  }
}; 