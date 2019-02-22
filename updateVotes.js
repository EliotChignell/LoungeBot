const Discord = require('discord.js');
const myjsonapi = require('myjson-api');
const request = require('request-promise');
const Enmap = require('enmap');

const secrets = require('./secrets.json');

const client = new Discord.Client();

const votes = new Enmap({name:"userVotes"});
client.points = new Enmap({name:"points"});

client.once('ready', () => {
  console.log(client.user.tag+" is ready!");
});

client.on('message', message => {

  if (!message.content.startsWith("l;")) return;

  votes.ensure(message.author.id, {
    id: message.author.id,
    voted: false,
    rewarded: false
  });

  var options = {                 
    method: 'GET',             
    uri: 'https://discordbots.org/api/bots/442184461405126656/check?userId='+message.author.id,
    json: true,                   
    headers: {               
      'Authorization': secrets.dbl                  
    }
  };

  request(options, (e,r,b) => {

    if (!b.voted) return;

    if (b.voted == 0 && votes.get(message.author.id, "rewarded")) {
      console.log(message.author.id+": voted=0 rewarded=true");
      votes.set(message.author.id, false, "rewarded");
    }

    if (b.voted == 1 && !votes.get(message.author.id, "rewarded")) { // Time to reward
      console.log(message.author.id+": voted=1 rewarded=false");

      let reward = Math.floor(500+(client.points.get(message.author.id, "points")/75));

      client.points.math(message.author.id, "+", reward, "points");
      votes.set(message.author.id, true, "rewarded");

      let embed = new Discord.RichEmbed()
        .setTitle("Thanks for voting!")
        .setAuthor("LoungeBot",client.user.displayAvatarURL)
        .setColor(0x363A3F)
        .setFooter("l;[command]")
        .setTimestamp()
        .addField("Make sure to vote daily!","Your reward is: "+reward+" credits.")
        message.author.send(embed);

    }

  });

});

client.login(secrets.token);