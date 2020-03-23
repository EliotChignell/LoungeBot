const Discord = require("discord.js");
const help = require("../docs/help.json");

module.exports = {
	name: 'help',
	description: 'Displays all available commands and specific command information by means of "l;help command".',
  aliases: [],
	execute(message, args, client) {
		if (args[0]) {
      for (var i in help) {
        help[i].names.forEach(element => {
          if (args[0].toLowerCase() == element) {
            sendEmbed = true;
            eTitle = "Help information on the command "+help[i].names[0];
            eDescription = "Description: ```"+help[i].description+"```\n\
                            Usage: ```"+help[i].usage+"```";
            let embed = new Discord.RichEmbed()
              .setTitle("Help information on the command "+help[i].names[0])
              .setColor(0x8E44AD)
              .setDescription("Description: ```"+help[i].description+"```\nUsage: ```"+help[i].usage+"```")
              message.channel.send(embed);
          }
        });
      }
    } else if (!args[0]) {
      let embed = new Discord.RichEmbed()
        .setTitle("Help")
        .setColor(0x8E44AD)
        .setDescription("These are the commands/games that you can use/play:```prolog\nNormal Commands:\nhelp ping bal board invite\n\nGames\n'Hangman': l;hangman start\n'Whos that Pokémon': l;pokemon```")
        message.channel.send(embed);
    }
	},
};