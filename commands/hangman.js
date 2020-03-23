// Libraries
const Discord = require("discord.js");
const Enmap = require("enmap");
const MyJSONAPI = require('myjson-api');
const request = require('request');
const pokedexPromiseV2 = require('pokedex-promise-v2');
const DiscordBotList = require('dblapi.js');
const fs = require("fs");
const colors = require("colors");

// JSON Files
const nouns = require('../docs/wordLists/nouns.json');

const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

// Useful functions
function randInt(a,b){return Math.floor((Math.random()*b)+a)}
function msToTime(e){var n=parseInt(e%1e3/100),r=parseInt(e/1e3%60),t=parseInt(e/6e4%60),a=parseInt(e/36e5%24);return(a=a<10?"0"+a:a)+"h:"+(t=t<10?"0"+t:t)+"m:"+(r=r<10?"0"+r:r)+"s"}
function msToTime2(e){parseInt(e%1e3/100);var n=parseInt(e/1e3%60),r=parseInt(e/6e4%60),s=parseInt(e/36e5%24),t=parseInt(e/864e5%7);return(t=t<10?"0"+t:t)+"d:"+(s=s<10?"0"+s:s)+"h:"+(r=r<10?"0"+r:r)+"m:"+(n=n<10?"0"+n:n)+"s."}

module.exports = {
	name: 'hangman',
	description: 'The simple yet fun single-player game of hangman.',
  aliases: ["hang","hm"],
	execute(message, args, client) {
    // Enmaps
    let games = {
      hangman: new Enmap({name:"hangman"}),
    };
    client.points = new Enmap({name: "points"});

    // Embed stuff
    let sendEmbed = false,
        eTitle = "",
        eDescription = "",
        eThumbnail = "",
        eImage = "";

    // Getting an ID of a sent message
    function getSentMessageID(messageContent) {
      return new Promise(async resolve => {
        let m = await message.channel.send(messageContent);
        resolve(m.id);
      });
    }

    (async function() {
      await games.hangman.defer;
      await client.points.defer;

      if (!args[0] || args[0] == "start") { // Starting

        if (message.guild.members.get("442184461405126656").hasPermission("MANAGE_MESSAGES") && games.hangman.get(message.author.id)) {
          if (message.channel.messages.get(games.hangman.get(message.author.id, "lastMessageID"))) {
            message.channel.messages.get(games.hangman.get(message.author.id, "lastMessageID")).delete();
          }
        }

        // Setting the useful variables in the enmap
        let randomInteger = randInt(0,nouns.nouns.length);
        games.hangman.set(message.author.id, {
          "inGame": true,
          "word": nouns.nouns[randomInteger].toLowerCase().split(''),
          "nonDuplicates": nouns.nouns[randomInteger].toLowerCase().split('').filter((item, pos, self) => {return self.indexOf(item) == pos}),
          "attempts": 0,
          "lettersAttempted": [],
          "lettersCorrect": [],
        });

        eTitle = `Hangman (${message.author.tag})`;
        games.hangman.get(message.author.id, "word").forEach(a => {
          eDescription += ":white_large_square: ";
        });

        eDescription += "\n\nGuesses Left: "+(10-(games.hangman.get(message.author.id, "attempts")))+"\nLetters Wrong: "+games.hangman.get(message.author.id, "lettersAttempted");
      } else if (args[0].length == 1) {
        if (!letters.includes(args[0].toLowerCase())) return message.channel.send("Please specify a letter A-Z!");
        
        if (!games.hangman.get(message.author.id)) {
          return message.channel.send("Please start a game using `l;hangman start`");
        } else if (!games.hangman.get(message.author.id, "inGame")) {
          return message.channel.send("Please start a game using `l;hangman start`");
        }
        
        if (!games.hangman.get(message.author.id, "word").includes(args[0].toLowerCase())) { // Wrong
          if (message.guild.members.get("442184461405126656").hasPermission("MANAGE_MESSAGES") && games.hangman.get(message.author.id)) {
            message.channel.messages.get(games.hangman.get(message.author.id, "lastMessageID")).delete();
          }
          games.hangman.set(message.author.id, message.id, "lastMessageID");

          if (!games.hangman.get(message.author.id, "lettersAttempted").includes(args[0].toLowerCase())) {
            games.hangman.math(message.author.id, "+", 1, "attempts");
          }

          if (games.hangman.get(message.author.id, "attempts") > 9) { // Lost

            let letterBlocks = "";
            games.hangman.get(message.author.id, "word").forEach(e => {
              letterBlocks += ":regional_indicator_"+e+": ";
            });

            let embed = new Discord.RichEmbed()
              .setTitle(`Hangman (${message.author.tag})`)
              .setColor(0x8E44AD)
              .setDescription(letterBlocks + "\n\nYou Lost :(\nTherefore, you recieve no credits.");

            let aaa = await getSentMessageID(embed);
            return games.hangman.set(message.author.id, aaa, "lastMessageID");
          }

          games.hangman.push(message.author.id, args[0].toLowerCase(), "lettersAttempted");
          sendEmbed = true;
          eTitle = `Hangman (${message.author.tag})`;

          games.hangman.get(message.author.id, "word").forEach(e => {
            if (games.hangman.get(message.author.id, "lettersCorrect").includes(e)) {
              eDescription += ":regional_indicator_"+e+": ";
            } else {
              eDescription += ":white_large_square: ";
            }
          });

          eDescription += "\n\nYou were wrong!\nGuesses Left: "+(10-(games.hangman.get(message.author.id, "attempts")))+"\nLetters Wrong: "+games.hangman.get(message.author.id, "lettersAttempted");

        } else if (games.hangman.get(message.author.id, "word").includes(args[0].toLowerCase())) { // Correct
          
          if (message.guild.members.get("442184461405126656").hasPermission("MANAGE_MESSAGES") && games.hangman.get(message.author.id)) {
            message.channel.messages.get(games.hangman.get(message.author.id, "lastMessageID")).delete();
          }
          games.hangman.set(message.author.id, message.id, "lastMessageID");
          games.hangman.push(message.author.id, args[0].toLowerCase(), "lettersCorrect");
          if (games.hangman.get(message.author.id, "nonDuplicates").length == games.hangman.get(message.author.id, "lettersCorrect").length) { // Won

            games.hangman.set(message.author.id, false, "inGame");
            client.points.math(message.author.id, "+", 50*games.hangman.get(message.author.id, "word").length, "points");

            let letterBlocks = "";
            games.hangman.get(message.author.id, "word").forEach(e => {
              if (games.hangman.get(message.author.id, "lettersCorrect").includes(e)) {
                letterBlocks += ":regional_indicator_"+e+": ";
              } else {
                letterBlocks += ":white_large_square: ";
              }
            });

            let embed = new Discord.RichEmbed()
              .setTitle(`Hangman (${message.author.tag})`)
              .setColor(0x8E44AD)
              .setDescription(letterBlocks + "\n\nYou Won!\nTherefore, you recieve "+50*games.hangman.get(message.author.id, "word").length+" credits!");
            let aa = await getSentMessageID(embed);
            return games.hangman.set(message.author.id, aa, "lastMessageID");
          }

          sendEmbed = true;
          eTitle = `Hangman (${message.author.tag})`;
          games.hangman.get(message.author.id, "word").forEach(e => {
            if (games.hangman.get(message.author.id, "lettersCorrect").includes(e)) {
              eDescription += ":regional_indicator_"+e+": ";
            } else {
              eDescription += ":white_large_square: ";
            }
          });

          eDescription += "\n\nYou were right!\nGuesses Left: "+(10-(games.hangman.get(message.author.id, "attempts")))+"\nLetters Wrong: "+games.hangman.get(message.author.id, "lettersAttempted");
        }
      }
    
    let embed = new Discord.RichEmbed()
      .setTitle(eTitle)
      .setColor(0x8E44AD)
      .setDescription(eDescription)
      .setFooter("l;help")
      .setImage(eImage)
      .setThumbnail(eThumbnail)
      .setTimestamp();
    let a = await getSentMessageID(embed);
    return games.hangman.set(message.author.id, a, "lastMessageID");
    }())		
	},
};