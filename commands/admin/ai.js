const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('7dai')
        .setDescription('Toggle AI integration on/off')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Enable or disable AI')
                .setRequired(false)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' },
                    { name: 'Status', value: 'status' }
                )),
    
    async execute(interaction, { config, configFile, aiIntegration }) {
        const fs = require('fs');
        
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
        }

        const action = interaction.options.getString('action');
        
        if (!action || action === 'status') {
            // Show current status
            const currentStatus = config['ai-enabled'] ? '✅ Enabled' : '❌ Disabled';
            const personality = config['ai-personality'] ? config['ai-personality'].substring(0, 100) + '...' : 'Not set';
            const model = config['ai-llm'] || 'Not set';
            
            return interaction.reply({
                embeds: [{
                    title: '🤖 AI Integration Status',
                    fields: [
                        { name: 'Status', value: currentStatus, inline: true },
                        { name: 'Model', value: model, inline: true },
                        { name: 'API Key', value: config['openrouter-api-key'] ? '✅ Set' : '❌ Not set', inline: true },
                        { name: 'Personality', value: personality, inline: false }
                    ],
                    color: config['ai-enabled'] ? 0x00ff00 : 0xff0000,
                    timestamp: new Date()
                }],
                ephemeral: true
            });
        }

        if (action === 'enable') {
            if (config['ai-enabled']) {
                return interaction.reply({ content: '🤖 AI is already enabled!', ephemeral: true });
            }
            
            // Check if API key is set
            if (!config['openrouter-api-key'] || config['openrouter-api-key'].trim() === '') {
                return interaction.reply({ 
                    content: '❌ Cannot enable AI: OpenRouter API key is not set in config.json', 
                    ephemeral: true 
                });
            }
            
            // Enable AI
            config['ai-enabled'] = true;
            
            // Update config file
            try {
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
                
                // Update AI integration instance
                if (aiIntegration) {
                    aiIntegration.enabled = true;
                }
                
                return interaction.reply({ 
                    content: '🤖 ✅ AI Integration has been **enabled**! The bot will now respond to chat messages and generate death roasts.', 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Error updating config:', error);
                return interaction.reply({ 
                    content: '❌ Failed to update config file. Check console for errors.', 
                    ephemeral: true 
                });
            }
        }

        if (action === 'disable') {
            if (!config['ai-enabled']) {
                return interaction.reply({ content: '🤖 AI is already disabled!', ephemeral: true });
            }
            
            // Disable AI
            config['ai-enabled'] = false;
            
            // Update config file
            try {
                fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
                
                // Update AI integration instance
                if (aiIntegration) {
                    aiIntegration.enabled = false;
                }
                
                return interaction.reply({ 
                    content: '🤖 ❌ AI Integration has been **disabled**! The bot will no longer respond to chat messages or generate death roasts.', 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Error updating config:', error);
                return interaction.reply({ 
                    content: '❌ Failed to update config file. Check console for errors.', 
                    ephemeral: true 
                });
            }
        }
    },
}; 