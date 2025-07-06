const { SlashCommandBuilder } = require('@discordjs/builders');
const pjson = require('../../package.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('7dinfo')
    .setDescription('Get info about the bot.'),
  async execute(interaction, { d7dtdState, config }) {
    // -1 = Error, 0 = No connection/connecting, 1 = Online, -100 = Override or N/A (value is ignored)
    var statusMsg;
    switch(d7dtdState.connStatus) {
    default:
      statusMsg = ":red_circle: Error";
      break;
    case 0:
      statusMsg = ":white_circle: Connecting...";
      break;
    case 1:
      statusMsg = ":green_circle: Online";
      break;
    }

    var cmdString = "";
    if(!config["disable-commands"]) {
      cmdString = `\n**Commands:** /info, /time, /version, /players`;
    }

    var string = `Server connection: ${statusMsg}${cmdString}\n\n*Dishorde v${pjson.version} - Powered by discord.js ${pjson.dependencies["discord.js"].replace("^","")}.*`;
    await interaction.reply({embeds: [{description: string}] });
  },
}; 