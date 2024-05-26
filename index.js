const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelTypes, Intents, InteractionType, MessageEmbed } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageTyping
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
});

let prefix = '+';

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}!http://localhost:3000`);
  client.user.setActivity('made by tiyoky ❤️', { type: 'WATCHING' });
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

    message.guild.emojis.create({ attachment: `https://cdn.discordapp.com/emojis/${emojiId}.png`, name: emojiName })
      .then(emoji => message.channel.send(`Emoji ${emoji} créé avec succès!`))
      .catch(error => {
        console.error('Erreur lors de la création de l\'emoji:', error);
        message.channel.send("Une erreur s'est produite lors de la création de l'emoji.");
      });
  }

  if (command === 'gcreate') {
    if (args.length < 4) {
      return message.channel.send(`Usage: ${prefix}gcreate <titre> <description> <temps en minutes> <nombre gagnant>`);
    }

    const [title, description, time, winnersCount] = args;
    const duration = parseInt(time) * 60000; // Convertir les minutes en millisecondes
    const winnersNumber = parseInt(winnersCount);

    if (isNaN(duration) || isNaN(winnersNumber)) {
      return message.channel.send('Veuillez fournir un temps et un nombre de gagnants valides.');
    }

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: 'Nombre de gagnants', value: `${winnersNumber}`, inline: true },
        { name: 'Temps', value: `${time} minutes`, inline: true } // Afficher le temps en minutes
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
  }

  if (command === 'kissorkill') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    try {
      const response = await axios.get('https://api.waifu.pics/sfw/waifu');
      const imageUrl = response.data.url;

      const kissOrKillEmbed = new EmbedBuilder()
        .setTitle('**kiss or kill?**')
        .setImage(imageUrl)
        .setColor('#FF69B4');

      const kissOrKillMessage = await message.channel.send({ embeds: [kissOrKillEmbed] });
      await kissOrKillMessage.react('💋'); 
      await kissOrKillMessage.react('🔪'); 
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image d\'anime:', error);
      message.channel.send('Une erreur s\'est produite en récupérant l\'image d\'anime.');
    }
  }


  if (command === 'avatar') {
    const user = message.mentions.users.first() || message.author;
    const avatarEmbed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setColor('#008080');

    message.channel.send({ embeds: [avatarEmbed] });
  }




  if (command === 'help') {
    const helpEmbeds = [
      new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('Menu d\'aide - Page 1')
        .setDescription('Voici les commandes disponibles :')
        .addFields(
          { name: `${prefix}prefix <nouveau préfixe>`, value: 'Change le préfixe du bot.' },
          { name: `${prefix}help`, value: 'Affiche ce message d\'aide.' },
          { name: `${prefix}mute <@user>`, value: 'Mute un utilisateur.' },
          { name: `${prefix}unmute <@user>`, value: 'Unmute un utilisateur.' },
          { name: `${prefix}kick <@user>`, value: 'Kick un utilisateur.' },
          { name: `${prefix}ban <@user>`, value: 'Ban un utilisateur.' },
          { name: `${prefix}gcreate <titre> <description> <temps en minutes> <nombre gagnant>`, value: 'Crée un giveaway.' }
        )
        .setFooter({ text: 'Page 1/3 - made by tiyoky', iconURL: client.user.displayAvatarURL() }),
      new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('Menu d\'aide - Page 2')
        .setDescription('Voici les commandes disponibles :')
        .addFields(
          { name: `${prefix}stop`, value: 'Arrête le bot (owner only)' },
          { name: `${prefix}restart`, value: 'restart le bot (owner only)' },
          { name: `${prefix}say <msg>`, value: 'Envoie le message (admin only)' },
          { name: `${prefix}avatar`, value: 'Affiche l\'avatar d\'un utilisateur.' },
          { name: `${prefix}who`, value: 'Infos sur le bot.' }
        )
        .setFooter({ text: 'Page 2/3 - made by tiyoky', iconURL: client.user.displayAvatarURL() }),
      new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('Menu d\'aide - Page 3')
        .setDescription('Voici les commandes disponibles :')
        .addFields(
          { name: `${prefix}cat`, value: 'Affiche une image de chat aléatoire.' },
          { name: `${prefix}dog`, value: 'Affiche une image de chien aléatoire.' },
          { name: `${prefix}kissorkill`, value: 'envoie un embed kiss or kill (admin only)' },
          { name: `${prefix}blague`, value: 'envoie une blague aléatoire' },
          { name: `${prefix}random`, value: 'envoie un truc random de l\'internet' }
        )
        .setFooter({ text: 'Page 3/3 - made by tiyoky', iconURL: client.user.displayAvatarURL() })
      ];

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
      );

    const helpMessage = await message.channel.send({ embeds: [helpEmbeds[0]], components: [row] });

    const filter = i => i.customId === 'previous' || i.customId === 'next';
    const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

    let currentPage = 0;
    collector.on('collect', async i => {
      if (i.customId === 'next') {
        currentPage = (currentPage + 1) % helpEmbeds.length;
      } else if (i.customId === 'previous') {
        currentPage = (currentPage - 1 + helpEmbeds.length) % helpEmbeds.length;
      }
      await i.update({ embeds: [helpEmbeds[currentPage]], components: [row] });
    });
  }

  
  if (command === 'spam') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const [msg, times] = args;
    const numberOfTimes = parseInt(times, 10);

    if (!msg || isNaN(numberOfTimes) || numberOfTimes <= 0) {
      return message.channel.send(`Usage: ${prefix}spam <message> <nombredefois>`);
    }

    for (let i = 0; i < numberOfTimes; i++) {
      message.channel.send(msg);
    }
  }

  
  if (command === 'say') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const sayMessage = args.join(' ');
    message.channel.send(sayMessage);
  }

  if (command === 'who') {
    return message.channel.send('Entièrement fait de A à Z par _tiyoky');
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
    if (command === 'random') {
      try {
        const response = await axios.get('https://api.imgflip.com/get_memes');
        const memes = response.data.data.memes;
        const randomIndex = Math.floor(Math.random() * memes.length);
        const randomMeme = memes[randomIndex];
        const memeEmbed = new EmbedBuilder()
          .setTitle(randomMeme.name)
          .setImage(randomMeme.url)
          .setColor('#FF4500');
        message.channel.send({ embeds: [memeEmbed] });
      } catch (error) {
        console.error('Erreur lors de la récupération du meme :', error);
        message.channel.send('Une erreur s\'est produite en récupérant le meme.');
        }
      }
  

  if (command === 'restart') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    const ownerId = '1018206885704372274';

    if (message.author.id !== ownerId) {
      return message.channel.send('Seul le propriétaire du bot peut utiliser cette commande.');
    }

    message.channel.send('Redémarrage du bot...');
    client.destroy();

    setTimeout(() => {
      client.login(process.env.TOKEN);
    }, 3000); 
  }

  
  if (command === 'stop') {
    const ownerId = '1018206885704372274';
    if (message.author.id !== ownerId) {
      return message.channel.send('Seul le propriétaire du bot peut utiliser cette commande.');
    }

    message.channel.send('Arrêt du bot...');
    client.destroy();
  }

  if (command === 'cat') {
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search');
      const catImageUrl = response.data[0].url;
      const catEmbed = new EmbedBuilder()
        .setTitle('Voici un chaton !')
        .setImage(catImageUrl)
        .setColor('#FF4500');
      message.channel.send({ embeds: [catEmbed] });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de chat:', error);
      message.channel.send('Une erreur s\'est produite en récupérant l\'image de chat.');
    }
  }

  if (command === 'dog') {
    try {
      const response = await axios.get('https://dog.ceo/api/breeds/image/random');
      const dogImageUrl = response.data.message;
      const dogEmbed = new EmbedBuilder()
        .setTitle('Voici un chien !')
        .setImage(dogImageUrl)
        .setColor('#FF4500');
      message.channel.send({ embeds: [dogEmbed] });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image de chien:', error);
      message.channel.send('Une erreur s\'est produite en récupérant l\'image de chien.');
    }
  }

  if (command === 'blague') {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const joke = response.data;

      const jokeEmbed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('Voici une blague pour toi !')
        .setDescription(`${joke.setup}\n\n${joke.punchline}`)
        .setFooter({ text: 'Blague générée', iconURL: client.user.displayAvatarURL() });

      message.channel.send({ embeds: [jokeEmbed] });
    } catch (error) {
      console.error('Erreur lors de la récupération de la blague :', error);
      message.channel.send('Une erreur s\'est produite en récupérant la blague.');
    }
    }
    });

client.login(process.env.TOKEN);
