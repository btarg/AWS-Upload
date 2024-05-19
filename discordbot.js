const { Client, EmbedBuilder, IntentsBitField, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    // should be able to read and write to guilds, read guild members, read messages, and read message content
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]
});
require('dotenv').config();

const { createUploadLink } = require('./routes/linkgenerator');
const { eventEmitter, searchFile } = require('./services/fileService');
const { getFullHostname } = require('./utils/hostname');
const { resolveFileType } = require('friendly-mimes');

client.login(process.env.DISCORD_BOT_TOKEN);

client.on('ready', () => {
    console.log(`Discord bot is ready`);

    const uploadLinkCommand = new SlashCommandBuilder()
        .setName('upload')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to send the file to when done')
                .setRequired(false))
        .setDescription('Generate a link to upload a file')
        .setDMPermission(true);

    const searchFileCommand = new SlashCommandBuilder()
        .setName('searchfile')
        .setDescription('Search for a file by name')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Name of the file to search for')
                .setRequired(true));

    // Register the commands with the bot
    client.application.commands.create(uploadLinkCommand);
    client.application.commands.create(searchFileCommand);

});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName } = interaction;

    if (commandName === 'upload') {
        // get the user option
        const targetuser = interaction.options.getUser('user');
        console.log("Target user: " + targetuser);
        // if the user option is set then set a variable for id
        var finalChannel = interaction.channel.id;
        var isDM = false;
        if (targetuser) {
            finalChannel = targetuser.id;
            isDM = true;
        }

        const link = createUploadLink(interaction.guild.id, finalChannel, interaction.user.id, isDM);
        interaction.reply({ content: link, ephemeral: true });

    } else if (commandName === 'searchfile') {
        const filename = interaction.options.getString('filename');
        console.log("Searching for file: " + filename);
        searchFile(interaction.guild.id, interaction.user.id, filename)
            .then((file) => {
                // Reply with the file details or a message saying the file was found
                const hostname = getFullHostname(process.env.HOSTNAME || "localhost");
                const downloadLink = `${hostname}/download/${file[0].fileid}`;
                interaction.reply({ content: `File found: ${downloadLink}`, ephemeral: true });
            })
            .catch((error) => {
                console.error('Error searching for file:', error);
                interaction.reply('Failed to find file');
            });
    }
});


eventEmitter.on('fileUploaded', async (eventData) => {
    const { channelId, userId, isDM, fileName, fileSize, downloadLink } = eventData;

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error(`Channel not found: ${channelId}`);
        return;
    }

    const member = await channel.guild.members.fetch(userId);
    const displayName = member.displayName;
    console.log(displayName);

    const ext = "." + fileName
        .split('.')
        .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
        .slice(1)
        .join('.')
    const fileMime = resolveFileType(ext); // get friendly mime data

    const user = client.users.cache.get(userId);
    let avatarURL;
    if (user) {
        avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        console.log(avatarURL);
    } else {
        console.log('User not found');
        return;
    }

    const embed = new EmbedBuilder()
        .setAuthor({
            name: displayName, // use the displayName instead of user.username
            url: downloadLink,
            iconURL: avatarURL
        })
        .setTitle(fileName)
        .setURL(downloadLink)
        .addFields(
            {
                name: "File type",
                value: fileMime.name || fileMime.mime,
                inline: true
            },
            {
                name: "Size",
                value: "11gb", //TODO: pretty bytes
                inline: true
            },
        )
        .setThumbnail("https://slate.dan.onl/slate.png") // TODO: thumbnail based on filetype
        .setColor(user.accent_color.toString(16).padStart(6, '0'))
        .setFooter({
            text: displayName, // use the displayName instead of user.username
            iconURL: avatarURL,
        })
        .setTimestamp();

    if (isDM == true) {
        console.log("Sending DM message");
        client.users.cache.get(channelId).send({ embeds: [embed] });
    } else {
        console.log("Sending channel message");
        channel.send({ embeds: [embed] });
    }
});

module.exports = {
    client
};