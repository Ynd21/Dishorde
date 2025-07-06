const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dtime')
    .setDescription('Shows the in-game time and days until the next horde.'),
  async execute(interaction, { telnet, handleCmdError, handleTime, processTelnetResponse, d7dtdState }) {
    telnet.exec("gettime", (err, response) => {
      if(!err) {
        processTelnetResponse(response, (line) => {
          if(line.startsWith("Day")) {
            d7dtdState.receivedData = 1;
            handleTime(line, interaction);
          }
        });

        // Sometimes, the response doesn't have the data we're looking for...
        if(!d7dtdState.receivedData) {
          d7dtdState.waitingForTime = 1;
          d7dtdState.waitingForTimeMsg = interaction;
          interaction.reply("Waiting for server response...");
        }
      }
      else {
        handleCmdError(err);
      }
    });
  },
}; 