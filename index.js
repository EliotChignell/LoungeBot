// LoungeBot

// Libraries
const Discord = require("discord.js");
const Enmap = require("enmap");
const MyJSONAPI = require('myjson-api');
const request = require('request');

// JSON files
const secrets = require("./secrets.json");
const nouns = require('./docs/wordLists/nouns.json');
const help = require('./docs/help.json');

// Uploading help.json
MyJSONAPI.update('1d3p5k', require('./docs/help.json'));

// Enmaps
let games = {
  hangman: new Enmap({name:"hangman"})
};

let other = new Enmap({name:"other"});

// Prefix 
const prefix = "l;";

// Useful functions
function randInt(a,b){return Math.floor((Math.random()*b)+a)}
function msToTime(e){var n=parseInt(e%1e3/100),r=parseInt(e/1e3%60),t=parseInt(e/6e4%60),a=parseInt(e/36e5%24);return(a=a<10?"0"+a:a)+"h:"+(t=t<10?"0"+t:t)+"m:"+(r=r<10?"0"+r:r)+"s"}
function msToTime2(e){parseInt(e%1e3/100);var n=parseInt(e/1e3%60),r=parseInt(e/6e4%60),s=parseInt(e/36e5%24),t=parseInt(e/864e5%7);return(t=t<10?"0"+t:t)+"d:"+(s=s<10?"0"+s:s)+"h:"+(r=r<10?"0"+r:r)+"m:"+(n=n<10?"0"+n:n)+"s."}

// Other variables
const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

// Client
const client = new Discord.Client();
client.points = new Enmap({name: "points"});

client.once("ready", () => {
  console.log("Ready!");
  client.user.setActivity('l;help | '+client.users.size+' users among '+client.guilds.size+' servers.', { type: 'LISTENING' });
});

client.on('message', async message => {
  
  if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;
  if (client.points.get("rewarded")) client.points.delete("rewarded");

  if (!other.get("rewarded")) other.set("rewarded", []);

  if (message.guild.me.hasPermission("MANAGE_NICKNAMES")) message.guild.me.setNickname('');

  // Uploading help.json
  MyJSONAPI.update('1d3p5k', require('./docs/help.json'));

  client.points.ensure(message.author.id, {
    id: message.author.id,
    points: 100
  });

  /*
  let randomInteger = Math.floor((Math.random() * nouns.nouns.length-1) + 0);
  games.hangman.ensure(message.author.id, {
  	inGame: false,
  	word: [],
  	nonDuplicates: [],
  	attempts: 0,
  	lettersAttempted: [],
  	lettersCorrect: []
  });
  */
    
  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  // Logging
  console.log('['+message.author.tag+'] '+message.content); 

  // Embed Variables
  let sendEmbed = false,
      eTitle = "",
      eDescription = "",
      eThumbnail = "",
      eImage = "",
      user;
  
  switch(command) {

    // Utility Commands
    case 'help':
      sendEmbed = true;
      eTitle = "Help";
      eDescription = "These are the commands/games that you can use/play:```prolog\nNormal Commands:\nhelp ping uptime bal board vote reward\n\nGames\n'Hangman': l;hangman start```";
      break;

    case "uptime":
      sendEmbed = true;
      eTitle = "Uptime";
      eDescription = "This session of LoungeBot has been online for\n```"+msToTime2(client.uptime)+"```";
      break;

    case 'ping':
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
      break;

    case 'balance':
    case 'bal':
    case 'money':
    case 'credits':
    case 'creds':
      if (args[0]) {
        if (!message.mentions.users.first()) return message.channel.send('Please mention someone...');
        user = message.mentions.users.first() || client.users.get(args[0]);
        if (!client.points.has(user.id)) return message.channel.send('This user does not exist on my database...');
        sendEmbed = true;
        eTitle = user.username+"'s Balance";
        eDescription = client.points.get(user.id, 'points')+' credits';
      } else {
        sendEmbed = true;
        eTitle = message.author.username+"'s Balance";
        eDescription = client.points.get(message.author.id, 'points')+' credits';
      }
      break;

    case 'vote':
      sendEmbed = true;
      eTitle = "Daily voting";
      eDescription = "https://discordbots.org/bot/442184461405126656\nYou can get rewards for voting once every day!\nAfter voting, type `l;reward` to get your voting reward.";
      break;

    case 'reward':

      var options = {                 
        method: 'GET',             
        uri: 'https://discordbots.org/api/bots/442184461405126656/check?userId='+message.author.id,
        json: true,                   
        headers: {               
          'Authorization': secrets.dbl                  
        }
      };

      request(options, (e,r,b) => {
        console.log(other.get("rewarded"));
        console.log(b);
        if (b.voted == 0 && other.get("rewarded").includes(message.author.id)) other.remove("rewarded", message.author.id);
        if (b.voted == 1 && !other.get("rewarded").includes(message.author.id)) {
          let rewardedCredits = 250+Math.floor(client.points.get(message.author.id, "points")/10);
          client.points.math(message.author.id, "+", rewardedCredits, "points");
          other.push("rewarded", message.author.id);
          embed = new Discord.RichEmbed()
            .setTitle('Thanks for voting!')
            .setAuthor("LoungeBot",client.user.displayAvatarURL)
            .setColor(0xff8300)
            .setDescription("Make sure to vote every day to get rewards!\nYou recieved "+rewardedCredits+" credits!")
            .setFooter("l;[command]")
            .setTimestamp();
            message.author.send(embed);
        } else if (b.voted == 0) {
          message.channel.send("You have not voted!");
        }
      });
      break;
    
    case 'leaderboard':
    case 'board':

      if (args[0] || !message.guild) {
        let sorted = client.points.array().sort((a, b) => a.points - b.points).reverse().splice(0,10);
        console.log(sorted);
        sendEmbed = false;
        let rDescription = "The Worldwide Top 10:```diff\n";
        /*for (const data of sorted) {
          rDescription += "\n- "+client.users.get(parseInt(data.id)).tag+"\n+ "+data.points+" credits";
        }*/
        for (var i=0;i<sorted.length;i++) {
          if (client.users.get(sorted[i].id)) rDescription += "\n- "+client.users.get(sorted[i].id).tag+"\n+ "+sorted[i].points+" credits";
        }
        rDescription += '```';
        embed = new Discord.RichEmbed()
          .setTitle("Credits Leaderboard")
          .setAuthor("LoungeBot",client.user.displayAvatarURL)
          .setColor(0xff8300)
          .setDescription(rDescription)
          .setFooter("l;[command]")
          .setTimestamp();
        
        message.channel.send(embed);
      } else if (!args[0] && message.guild) {
        let foundUsers = [];
        let guildIDs = [];
        message.guild.members.forEach(member => {
          if (client.points.has(member.id)) guildIDs.push(member.id);
        });
        let sorted = client.points.array().filter(p => guildIDs.includes(p.id)).sort((a, b) => a.points - b.points).reverse().splice(0,10);
        let rDescription = "The Top 10 of the server `"+message.guild.name+"`:```diff\n";
        for (const data of sorted) {
          rDescription += "\n- "+client.users.get(data.id).tag+"\n+ "+data.points+" credits";
        }
        rDescription += '```\nType `l;board world` to find out the worldwide standings.';
        sendEmbed = false;
        embed = new Discord.RichEmbed()
          .setTitle("Credits Leaderboard")
          .setAuthor("LoungeBot",client.user.displayAvatarURL)
          .setColor(0xff8300)
          .setDescription(rDescription)
          .setFooter("l;[command]")
          .setTimestamp();
        message.channel.send(embed);
      }
      break;
  

    // Games
    case 'hangman':
      if (!args[0] || args[0] == "start") { // Starting

        // Setting the useful variables in the enmap
        let randomInteger = randInt(0,nouns.nouns.length);
        games.hangman.set(message.author.id, {
          "inGame": true,
          "word": nouns.nouns[randomInteger].split(''),
          "nonDuplicates": nouns.nouns[randomInteger].split('').filter((item, pos, self) => {return self.indexOf(item) == pos}),
          "attempts": 0,
          "lettersAttempted": [],
          "lettersCorrect": [] 
        });

        sendEmbed = true;
        eTitle = "Hangman";
        games.hangman.get(message.author.id, "word").forEach(a => {
          eDescription += ":white_large_square:";
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
          games.hangman.math(message.author.id, "+", 1, "attempts");

          if (games.hangman.get(message.author.id, "attempts") > 9) { // Lost
            games.hangman.set(message.author.id, false, "inGame");
            sendEmbed = true;
            eTitle = "Hangman";
            eDescription = "You Lost!\nThe word was: "+games.hangman.get(message.author.id, "word").join('');
            break;
          }

          games.hangman.push(message.author.id, args[0].toLowerCase(), "lettersAttempted");
          sendEmbed = true;
          eTitle = "Hangman";

          games.hangman.get(message.author.id, "word").forEach(e => {
            if (games.hangman.get(message.author.id, "lettersCorrect").includes(e)) {
              eDescription += ":regional_indicator_"+e+":";
            } else {
              eDescription += ":white_large_square:";
            }
          });

          eDescription += "\nYou were wrong!\nGuesses Left: "+(10-(games.hangman.get(message.author.id, "attempts")))+"\nLetters Wrong: "+games.hangman.get(message.author.id, "lettersAttempted");

        } else if (games.hangman.get(message.author.id, "word").includes(args[0].toLowerCase())) { // Correct
          
          games.hangman.push(message.author.id, args[0].toLowerCase(), "lettersCorrect");
          console.log(games.hangman.get(message.author.id, "nonDuplicates").length+" "+games.hangman.get(message.author.id, "lettersCorrect").length);
          if (games.hangman.get(message.author.id, "nonDuplicates").length == games.hangman.get(message.author.id, "lettersCorrect").length) { // Won

            games.hangman.set(message.author.id, false, "inGame");

            sendEmbed = true;
            eTitle = "Hangman";
            eDescription = "You Won!\nThe word was: "+games.hangman.get(message.author.id, "word").join('')+"\nTherefore, you recieve "+50*games.hangman.get(message.author.id, "word").length+" credits!";
            client.points.math(message.author.id, "+", 50*games.hangman.get(message.author.id, "word").length, "points");

            break;
          }

          sendEmbed = true;
          eTitle = "Hangman";
          games.hangman.get(message.author.id, "word").forEach(e => {
            if (games.hangman.get(message.author.id, "lettersCorrect").includes(e)) {
              eDescription += ":regional_indicator_"+e+":";
            } else {
              eDescription += ":white_large_square:";
            }
          });

          eDescription += "\nYou were right!\nGuesses Left: "+(10-(games.hangman.get(message.author.id, "attempts")))+"\nLetters Wrong: "+games.hangman.get(message.author.id, "lettersAttempted");
        }
      }
      break;

    default:
      sendEmbed = true;
      eTitle = "Command not found";
      eDescription = "Please use `l;help` to find out the available commands/games.";
      break;
  }

  if (sendEmbed) {
    let embed = new Discord.RichEmbed()
      .setTitle(eTitle)
      .setAuthor("LoungeBot",client.user.displayAvatarURL)
      .setColor(0x8E44AD)
      .setDescription(eDescription)
      .setFooter("l;[command]")
      .setImage(eImage)
      .setThumbnail(eThumbnail)
      .setTimestamp();
      message.channel.send(embed);
  }

});

client.login(secrets.token);
