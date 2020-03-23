const Discord = require("discord.js");
const Enmap = require("enmap");
const pokedexPromiseV2 = require('pokedex-promise-v2');

// Pokedex
let pokedex = new pokedexPromiseV2();

// Useful functions
function randInt(a,b){return Math.floor((Math.random()*b)+a)}

module.exports = {
	name: 'pokemon',
	description: 'Description',
  aliases: ['poke'],
	execute(message, args, client) {
    let games = {
      pokemon: new Enmap({name: "pokemon"}),
      pokemonPokedex: new Enmap({name: "pokemonPokedex"})
    };
    client.points = new Enmap({name: "points"});

    (async function(){
      await games.pokemon.defer;
      await games.pokemonPokedex.defer;
      await client.points.defer;
      
      games.pokemonPokedex.ensure(message.author.id, []);
      if (!args[0]) {
        pokedex.getPokemonByName(randInt(1,807), function(response, error) { // with callback
          if(!error) {
            games.pokemon.set(message.author.id, response.species.name);
            
            embed = new Discord.RichEmbed()
              .setTitle("Who's That Pokémon, "+message.author.username+"?")
              .setColor(0x8E44AD)
              .setDescription("Guess by typing `l;pokemon [name]`.")
              .setImage(response.sprites.front_default);
            message.channel.send(embed);
          } else {
            console.log(error)
          }
        });
      } else if (args[0]) {
        let name = games.pokemon.get(message.author.id);
        if (name == "dead") return message.channel.send("Please start a game using `l;pokemon`");
        if (args[0].toLowerCase() == name) { // yes
          if (!games.pokemonPokedex.get(message.author.id).includes(name)) games.pokemonPokedex.push(message.author.id, name);
          let credsEarned = Math.floor(100+randInt(1,name.length));
          client.points.math(message.author.id, "+", credsEarned, "points");
          let embed = new Discord.RichEmbed()
            .setTitle("Who's that Pokémon, "+message.author.username+"?")
            .setColor(0x8E44AD)
            .setDescription("Good Job!\nYou recieved "+credsEarned+" credits!\nYour pokédex count is now at: `" + games.pokemonPokedex.get(message.author.id).length + "/807`.");
          message.channel.send(embed);
        } else if (args[0].toLowerCase() != name) { // no
          games.pokemon.set(message.author.id, "dead");
          let embed = new Discord.RichEmbed()
            .setTitle("You were incorrect, "+message.author.username+"!")
            .setColor(0x8E44AD)
            .setDescription("The Pokémon was: `"+name+"`.\nYour pokédex count is at `" + games.pokemonPokedex.get(message.author.id).length + "/807`.");
          message.channel.send(embed);
        }
      }
    }())
		
	},
};