const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dversion')
    .setDescription('Shows the game version.'),
  async execute(interaction, { telnet, handleCmdError, processTelnetResponse, d7dtdState }) {
    telnet.exec("version", (err, response) => {
      if(!err) {
        processTelnetResponse(response, (line) => {
          if(line.startsWith("Game version:")) {
            interaction.reply(line);
            d7dtdState.receivedData = 1;
          }
        });

        if(!d7dtdState.receivedData) {
          d7dtdState.waitingForVersion = 1;
          d7dtdState.waitingForVersionMsg = interaction;
          interaction.reply("Waiting for server response...");
        }
      }
      else {
        handleCmdError(err);
      }
    });
  },
}; 