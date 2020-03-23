const Enmap = require("enmap");
const Discord = require("discord.js");

module.exports = {
	name: 'eval',
	description: 'An admin-only command.',
  aliases: [],
	async execute(message, args, client) {
    function getSendMessageID() {
      return new Promise(async resolve => {
        let a = await message.channel.send("Test");
        message.channel.send(a.id);
      });
    }
    client.points = new Enmap({name: "points"});
    (async function(){
      await client.points.defer;
      if (message.author.id == 401649168948396032) {
        message.channel.send(`\`${eval(args.join(" "))}\``);
      }
    }())
	},
};