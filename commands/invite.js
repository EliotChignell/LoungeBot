module.exports = {
	name: 'invite',
	description: 'Returns a link to invite the bot to servers.',
  aliases: [],
	execute(message, args) {
		message.channel.send('https://discordapp.com/api/oauth2/authorize?client_id=442184461405126656&permissions=0&scope=bot');
	},
};