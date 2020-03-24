// Libraries
const Discord = require("discord.js");
const Enmap = require("enmap");
const MyJSONAPI = require('myjson-api');
const request = require('request');
const pokedexPromiseV2 = require('pokedex-promise-v2');
const DiscordBotList = require('dblapi.js');
const fs = require("fs");
const colors = require("colors");

// Pokedex
let pokedex = new pokedexPromiseV2();

// JSON files
const secrets = require("./secrets.json");
const nouns = require('./docs/wordLists/nouns.json');
const help = require('./docs/help.json');

// dbl
const dbl = new DiscordBotList(secrets.dbl);

// Uploading help.json
MyJSONAPI.update('1d3p5k', require('./docs/help.json'));

// Enmaps
let games = {
  hangman: new Enmap({name:"hangman"}),
  pokemon: new Enmap({name:"pokemon"}),
  tictactoe: new Enmap({name:"tictactoe"})
};

let other = new Enmap({name:"other"});

// Prefix 
const prefix = "k;";

// Useful functions
function randInt(a,b){return Math.floor((Math.random()*b)+a)}
function msToTime(e){var n=parseInt(e%1e3/100),r=parseInt(e/1e3%60),t=parseInt(e/6e4%60),a=parseInt(e/36e5%24);return(a=a<10?"0"+a:a)+"h:"+(t=t<10?"0"+t:t)+"m:"+(r=r<10?"0"+r:r)+"s"}
function msToTime2(e){parseInt(e%1e3/100);var n=parseInt(e/1e3%60),r=parseInt(e/6e4%60),s=parseInt(e/36e5%24),t=parseInt(e/864e5%7);return(t=t<10?"0"+t:t)+"d:"+(s=s<10?"0"+s:s)+"h:"+(r=r<10?"0"+r:r)+"m:"+(n=n<10?"0"+n:n)+"s."}

// Other variables
const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
let clientReady = false;

// Client
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.points = new Enmap({name: "points"});

console.log("Step 1");
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

console.log("Step 2");
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  clientReady = true;
  console.log(`[${"Startup".green}] ${client.user.tag} is ready!`);
  client.user.setActivity("l;help");
});

client.on("message", message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  client.points.ensure(message.author.id, {
    id: message.author.id,
    points: 0
  });

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  console.log(`[${colors.blue(message.author.tag)}] ${message.content}`);

  try {
    command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply("[0] An error occured executing that command.");
  }
});

console.log(`[${"Startup".green}] Main file running.`);
client.login(secrets.token);