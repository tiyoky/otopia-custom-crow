const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js'); // Ajout de PermissionsBitField
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates 
  ],
  partials: [Partials.Channel]
});

let prefix = '+';

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  
  const statuses = [
    { name: 'made by tiyoky', type: 'WATCHING' },
    { name: 'otopia soon...', type: 'WATCHING' }
  ];
  
  let currentStatus = 0;

  setInterval(() => {
    client.user.setPresence({
      activities: [statuses[currentStatus]],
      status: 'online'
    });
    currentStatus = (currentStatus + 1) % statuses.length;
  }, 2000); 
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'prefix') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
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

      if (command === 'create') {
        if (!args.length || !args[0].match(/<:[a-zA-Z0-9]+:[0-9]+>/)) {
            return message.channel.send("Merci de spécifier un emoji valide.");
        }

        const emojiName = args[0].split(':')[1];
        const emojiId = args[0].split(':')[2].slice(0, -1);
        
        message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${emojiId}.png`, emojiName)
            .then(emoji => message.channel.send(`Emoji ${emoji} créé avec succès!`))
            .catch(error => {
                console.error('Erreur lors de la création de l\'emoji:', error);
                message.channel.send("Une erreur s'est produite lors de la création de l'emoji.");
            });


  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle('Menu d\'aide')
      .setDescription('Voici les commandes disponibles :')
      .addFields(
        { name: `${prefix}prefix <nouveau préfixe>`, value: 'Change le préfixe du bot.' },
        { name: `${prefix}help`, value: 'Affiche ce message d\'aide.' },
        { name: `${prefix}mute <@user>`, value: 'Mute un utilisateur.' },
        { name: `${prefix}unmute <@user>`, value: 'Unmute un utilisateur.' },
        { name: `${prefix}kick <@user>`, value: 'Kick un utilisateur.' },
        { name: `${prefix}ban <@user>`, value: 'Ban un utilisateur.' }
      )
      .setFooter({ text: 'made by tiyoky', iconURL: client.user.displayAvatarURL() });

    message.channel.send({ embeds: [helpEmbed] });
  }

  if (command === 'mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.channel.send('Vous n\'avez pas les permissions pour mute les membres.');
    }
    const user = message.mentions.members.first();
    if (!user) {
      return message.channel.send('Veuillez mentionner un utilisateur à mute.');
    }
    try {
      await user.voice.setMute(true, 'Muted by command');
      message.channel.send(`${user.user.tag} a été mute.`);
    } catch (err) {
      message.channel.send('Impossible de mute ce membre.');
    }
  }

  if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.channel.send('Vous n\'avez pas les permissions pour unmute les membres.');
    }
    const user = message.mentions.members.first();
    if (!user) {
      return message.channel.send('Veuillez mentionner un utilisateur à unmute.');
    }
    try {
      await user.voice.setMute(false, 'Unmuted by command');
      message.channel.send(`${user.user.tag} a été unmute.`);
    } catch (err) {
      message.channel.send('Impossible de unmute ce membre.');
    }
  }

  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.channel.send('Vous n\'avez pas les permissions pour kick les membres.');
    }
    const user = message.mentions.members.first();
    if (!user) {
      return message.channel.send('Veuillez mentionner un utilisateur à kick.');
    }
    try {
      await user.kick('Kicked by command');
      message.channel.send(`${user.user.tag} a été kick.`);
    } catch (err) {
      message.channel.send('Impossible de kick ce membre.');
    }
  }

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.channel.send('Vous n\'avez pas les permissions pour ban les membres.');
    }
    const user = message.mentions.members.first();
    if (!user) {
      return message.channel.send('Veuillez mentionner un utilisateur à ban.');
    }
    try {
      await user.ban({ reason: 'Banned by command' });
      message.channel.send(`${user.user.tag} a été ban.`);
    } catch (err) {
      message.channel.send('Impossible de ban ce membre.');
    }
  }
});

client.login(process.env.TOKEN);
