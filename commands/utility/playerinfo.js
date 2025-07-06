const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dplayerinfo')
    .setDescription('Shows your player registration information.'),
  async execute(interaction, { db }) {
    const discordId = interaction.user.id;
    
    try {
      await interaction.deferReply({ ephemeral: true });
      
      // Get player info from database
      db.get('SELECT * FROM Players WHERE discord_id = ?', [discordId], (err, row) => {
        if (err) {
          console.error('Error getting player info:', err);
          return interaction.editReply({ content: 'Database error occurred.' });
        }
        
        if (!row) {
          return interaction.editReply({ 
            content: 'You are not registered. Use `/7dregister <code>` with a code from in-game (!register) to register.' 
          });
        }
        
        const registeredDate = new Date(row.registered_at).toLocaleDateString();
        const lastSeenDate = new Date(row.last_seen_at).toLocaleDateString();
        const totalHours = Math.floor(row.total_logged_in_time_seconds / 3600);
        
        const infoMessage = `**Your Player Information:**
        
**Discord ID:** ${row.discord_id}
**Steam ID:** ${row.game_id || 'Unknown'}
**Epic/EOS ID:** ${row.cross_id || 'Unknown'}
**Currency:** ${row.currency} coins
**Total Play Time:** ${totalHours} hours
**Registered:** ${registeredDate}
**Last Seen:** ${lastSeenDate}`;
        
        interaction.editReply({ content: infoMessage });
      });
      
    } catch (err) {
      console.error(`Error in playerinfo command: ${err}`);
      if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: `Error getting player info: ${err.message}` });
      } else {
          await interaction.reply({ content: `Error getting player info: ${err.message}`, ephemeral: true });
      }
    }
  },
}; 