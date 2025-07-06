const { SlashCommandBuilder } = require('@discordjs/builders');

function parsePlayerList(lpResponse) {
    const players = [];
    if (!lpResponse) return players;

    const lines = lpResponse.split(/\n|\r/g);
    const playerRegex = /^\d+\. id=\d+, (.+?), pos=/;

    for (const line of lines) {
        const match = line.match(playerRegex);
        if (match && match[1]) {
            players.push(match[1]);
        }
    }
    return players;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dplayers')
    .setDescription('Shows a list of online players.'),
  async execute(interaction, { telnet, handleCmdError }) {
    telnet.exec("lp", (err, response) => {
      if(!err) {
        const playerNames = parsePlayerList(response);
        
        if (playerNames.length === 0) {
          interaction.reply("No players are currently online.");
        } else {
          const playerList = playerNames.map((name, index) => `${index + 1}. ${name}`).join('\n');
          const message = `**Online Players (${playerNames.length}):**\n\`\`\`\n${playerList}\n\`\`\``;
          interaction.reply(message);
        }
      }
      else {
        handleCmdError(err);
      }
    });
  },
}; 