const { Client, GatewayIntentBits, Partials, MessageEmbed } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});


let prefix = '+';

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  client.user.setPresence({
  activities: [{
    name: 'otopia soon...',
    type: 'STREAMING',
    url: 'https://discord.gg/hufWHfhnfR'
  }]
});


client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;


  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();


  if (command === 'prefix') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.channel.send('Seuls les administrateurs peuvent changer le préfixe.');
    }

    if (args.length === 1) {
      const newPrefix = args[0];
      prefix = newPrefix;
      message.channel.send(`Préfixe changé en ${newPrefix}`);
    } else {
      message.channel.send(`Usage: ${prefix}prefix <nouveau préfixe>`);
    }
  }

  if (command === 'help') {
    const helpEmbed = new MessageEmbed()
      .setColor('#00FF00') 
      .setTitle('Menu d\'aide')
      .setDescription('Voici les commandes disponibles :')
      .addFields(
        { name: `${prefix}prefix <nouveau préfixe>`, value: 'Change le préfixe du bot.' },
        { name: `${prefix}help`, value: 'Affiche ce message d\'aide.' }
      )
      .setFooter('Aide du Bot', client.user.displayAvatarURL());

    message.channel.send({ embeds: [helpEmbed] });
  }
});

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log(`\x1b[36m%s\x1b[0m`, `|    🐇 Logged in as ${client.user.tag}`);
  } catch (error) {
    console.error('Failed to log in:', error);
    process.exit(1);
  }
}

login()
