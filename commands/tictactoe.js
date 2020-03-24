const Enmap = require("enmap");
const Discord = require("discord.js");

module.exports = {
	name: 'name',
	description: 'Description',
  aliases: [],
	execute(message, args, client) {
		let games = {
      tic: new Enmap({name: "tictactoe"})
    };

    (async function() {
      await games.tic.defer;

      

      if (!args[0] || !message.mentions.users.first()) return message.channel.send("Please mention someone to challenge, e.g. `l;tictactoe @user#1234`");
      user = message.mentions.users.first();
      tictactoe.set(message.author.id+" "+user.id, {
        players: [message.author.id, user.id],
        currentPlayer: message.author.id,
        confirmed: false,
        board: [0,0,0,0,0,0,0,0,0]
      });

    }())
	},
};