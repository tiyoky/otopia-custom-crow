const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, MessageActionRow, MessageButton } = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
});

let prefix = '+';

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  
  const statuses = [
    { name: 'made by tiyoky', type: 'PLAYING' },
    { name: 'otopia soon...', type: 'PLAYING' }
  ];
  
  let currentStatus = 0;

  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: statuses[currentStatus].name, type: statuses[currentStatus].type }],
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
  } else if (command === 'create') {
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
  } else if (command === 'gcreate') {
    if (args.length < 4) {
      return message.channel.send(`Usage: ${prefix}gcreate <titre> <description> <temp en ms> <nombre gagnant>`);
    }

    const [title, description, time, winnersCount] = args;
    const duration = parseInt(time);
    const winnersNumber = parseInt(winnersCount);

    if (isNaN(duration) || isNaN(winnersNumber)) {
      return message.channel.send('Veuillez fournir un temps et un nombre de gagnants valides.');
    }

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: 'Nombre de gagnants', value: `${winnersNumber}`, inline: true },
        { name: 'Temps', value: `${duration}ms`, inline: true }
      )
      .setColor('#FF0000')
      .setFooter({ text: 'Réagissez avec 🎉 pour participer!' });

    const giveawayMessage = await message.channel.send({ embeds: [giveawayEmbed] });
    await giveawayMessage.react('🎉');

    setTimeout(async () => {
      const fetchedMessage = await message.channel.messages.fetch(giveawayMessage.id);
      const reactions = fetchedMessage.reactions.cache.get('🎉');
      
      if (!reactions) return message.channel.send('Pas de réactions.');

      const users = await reactions.users.fetch();
      const participants = users.filter(user => !user.bot).map(user => user.id);

      if (participants.length === 0) {
        return message.channel.send('Personne n\'a participé au giveaway.');
      }

      const winners = [];
      for (let i = 0; i < winnersNumber; i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        winners.push(participants.splice(randomIndex, 1)[0]);
      }

      message.channel.send(winners.map(winner => `<@${winner}>`).join(', ') + ' a/ont gagné! Créez un ticket pour réclamer votre prix.');

    }, duration);
  } else if (command === 'help') {
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
        { name: `${prefix}ban <@user>`, value: 'Ban un utilisateur.' },
        { name: `${prefix}gcreate <titre> <description> <temp en ms> <nombre gagnant>`, value: 'Crée un giveaway.' },
        { name: `${prefix}restart`, value: 'Redémarre le bot (réservé à l\'owner).' }
      )
      .setFooter({ text: 'made by tiyoky', iconURL: client.user.displayAvatarURL() });

    message.channel.send({ embeds: [helpEmbed] });
  } else if (command === 'mute') {
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
  } else if (command === 'unmute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Mute    } catch (err) {
      message.channel.send('Impossible de mute ce membre.');
    }
  } else if (command === 'unmute') {
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
  } else if (command === 'kick') {
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
  } else if (command === 'ban') {
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

  } else if (command === 'restart') {
    if (message.author.id !== '1018206885704372274') {
      return message.channel.send('Seul l\'owner du bot peut utiliser cette commande.');
    }
    
    message.channel.send('Redémarrage du bot...').then(() => {
      client.destroy().then(() => {
        process.exit();
      });
    });
  }
});

client.login(process.env.TOKEN);
