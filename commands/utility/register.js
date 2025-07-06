const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dregister')
    .setDescription('Register your Discord account with your in-game account using a registration code.')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The 6-digit registration code you received in-game.')
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(6)),
  async execute(interaction, { db, pendingRegistrations }) {
    const code = interaction.options.getString('code').trim();
    
    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return interaction.reply({ 
        content: 'Invalid code format. Please enter a 6-digit number.', 
        ephemeral: true 
      });
    }

    console.log(`[DEBUG] Registration attempt by ${interaction.user.tag} with code: ${code}`);
    console.log(`[DEBUG] Checking against ${pendingRegistrations.size} pending registrations...`);
    
    let registrationFound = false;
    
    for (const [gameId, regData] of pendingRegistrations.entries()) {
      console.log(`[DEBUG] Checking gameId ${gameId} with code ${regData.code}`);
      if (regData.code === code) {
        console.log(`[DEBUG] Code match found for gameId ${gameId}!`);
        registrationFound = true;
        
        if (Date.now() > regData.expiry) {
          pendingRegistrations.delete(gameId);
          return interaction.reply({ 
            content: 'This registration code has expired. Please type `!register` in-game again.', 
            ephemeral: true 
          });
        }
        
        const discordId = interaction.user.id;
        const registeredAt = new Date().toISOString();
        const crossId = regData.crossId; // Get CrossId from registration data
        
        console.log(`[DEBUG] Registering player - Discord: ${discordId}, Game: ${gameId}, Cross: ${crossId || 'unknown'}`);
        
        db.run(`INSERT OR REPLACE INTO Players (discord_id, game_id, cross_id, registered_at, last_seen_at) VALUES (?, ?, ?, ?, ?)`, 
          [discordId, gameId, crossId, registeredAt, registeredAt], 
          (err) => {
            if (err) {
              console.error('Error saving player registration:', err);
              return interaction.reply({ 
                content: 'There was a database error while trying to register you. Please contact an administrator.', 
                ephemeral: true 
              });
            } else {
              pendingRegistrations.delete(gameId);
              const message = crossId 
                ? 'Congratulations! Your Discord account has been successfully linked to your in-game account (Steam + EOS).'
                : 'Congratulations! Your Discord account has been successfully linked to your in-game account.';
              return interaction.reply({ 
                content: message, 
                ephemeral: true 
              });
            }
        });
        break;
      }
    }
    
    if (!registrationFound) {
      return interaction.reply({ 
        content: 'Invalid registration code. Please make sure you entered the correct 6-digit code and that it hasn\'t expired.', 
        ephemeral: true 
      });
    }
  },
}; 