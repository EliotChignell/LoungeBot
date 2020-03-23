const Enmap = require("enmap");
const Discord = require("discord.js");

module.exports = {
	name: 'leaderboard',
	description: 'Gives you the leaderboard for your current server or the world.',
  aliases: ['lb','board','leader'],
	execute(message, args, client) {
    let games = {
      pokemonPokedex: new Enmap({name: "pokemonPokedex"})
    };
    client.points = new Enmap({name: "points"});

    (async function(){
      await games.pokemonPokedex.defer;
      await client.points.defer;

      if (args[0] || !message.guild) {
        let sorted = client.points.array().sort((a, b) => a.points - b.points).reverse().splice(0,10);
        sendEmbed = false;
        embed = new Discord.RichEmbed();
        let rDescription = "**The Worldwide Top 10:**";

        for (var i=0;i<sorted.length;i++) {
          let pokedexCount = 0;
          if (games.pokemonPokedex.get(sorted[i].id)) pokedexCount = games.pokemonPokedex.get(sorted[i].id).length;
          if (client.users.get(sorted[i].id)) rDescription += "\n"+ (i+1) + ". " + client.users.get(sorted[i].id).tag+" - `"+sorted[i].points+"` credits, `" + pokedexCount + "/807` pokedex completed";
        }
        embed.setTitle("Credits Leaderboard")
          .setColor(0x8E44AD)
          .setDescription(rDescription);
        message.channel.send(embed);
      } else if (!args[0] && message.guild) {
        let foundUsers = [];
        let guildIDs = [];
        message.guild.members.forEach(member => {
          if (client.points.has(member.id)) guildIDs.push(member.id);
        });
        let sorted = client.points.array().filter(p => guildIDs.includes(p.id)).sort((a, b) => a.points - b.points).reverse().splice(0,10);
        let rDescription = "**The Top 10 of the server `"+message.guild.name+"`**:";
        let counter = 1;
        for (const data of sorted) {
          let pokedexCount = 0;
          if (games.pokemonPokedex.get(data.id)) pokedexCount = games.pokemonPokedex.get(data.id).length;
          rDescription += "\n"+ counter + ". " + client.users.get(data.id).tag+" - `"+data.points+"` credits, `" + pokedexCount + "/807` pokedex completed";
          counter++;
        }
        rDescription += '\nType `l;board world` to find out the worldwide standings.';
        sendEmbed = false;
        embed = new Discord.RichEmbed()
          .setTitle("Credits Leaderboard")
          .setColor(0x8E44AD)
          .setDescription(rDescription);
        message.channel.send(embed);
      }
    }())
		
	},
};