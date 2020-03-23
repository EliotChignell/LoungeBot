const Enmap = require("enmap");
const Discord = require("discord.js");

module.exports = {
	name: 'balance',
	description: 'Checks the balance for a user. Use "l;balance @user#1234" to see the balance of another user.',
  aliases: ['bal','credits','cred','creds','profile','b'],
	execute(message, args, client) {
    let games = {
      pokemonPokedex: new Enmap({name: "pokemonPokedex"}),
    };

    client.points = new Enmap({name: "points"});
		(async function() {
      await games.pokemonPokedex.defer;
      await client.points.defer;

      if (args[0]) {
        if (!message.mentions.users.first()) return message.channel.send('Please mention someone...');
        user = message.mentions.users.first() || client.users.get(args[0]);
        if (!client.points.has(user.id)) return message.channel.send('This user does not exist on my database...');
        let pokedexCount = 0;
        if (games.pokemonPokedex.get(user.id)) pokedexCount = games.pokemonPokedex.get(user.id).length;
        let embed = new Discord.RichEmbed()
          .setTitle(`${user.username}'s Balance`)
          .setColor(0x8E44AD)
          .setDescription(`${client.points.get(user.id, 'points')} credits\n\`${pokedexCount}/807\` pokedex completed`);
          message.channel.send(embed);
      } else {
        let pokedexCount = 0;
        if (games.pokemonPokedex.get(message.author.id)) pokedexCount = games.pokemonPokedex.get(message.author.id).length;
        let embed = new Discord.RichEmbed()
          .setTitle(`${message.author.tag}'s Balance`)
          .setColor(0x8E44AD)
          .setDescription(`${client.points.get(message.author.id, 'points')} credits\n\`${pokedexCount}/807\` pokedex completed`);
          message.channel.send(embed);
      }
    }())
	},
};