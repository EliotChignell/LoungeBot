// Libraries
const Discord = require("discord.js");
const Enmap = require("enmap");
const MyJSONAPI = require('myjson-api');
const request = require('request');
const pokedexPromiseV2 = require('pokedex-promise-v2');
const DiscordBotList = require('dblapi.js');
const fs = require("fs");
const colors = require("colors");

const client = new Discord.Client();

// Enmaps
let games = {
  hangman: new Enmap({name:"hangman"}),
  pokemon: new Enmap({name:"pokemon"}),
  tictactoe: new Enmap({name:"tictactoe"})
};
client.points = new Enmap({name: "points"});

module.exports = {
	name: 'ping',
	description: 'Ping!',
  aliases: [],
	execute(message, args) {
		message.channel.send('Pong.');
	},
};