import { Client, EmbedBuilder, IntentsBitField, SlashCommandBuilder } from 'discord.js';

export const client = new Client({
    // should be able to read and write to guilds, read guild members, read messages, and read message content
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]
});

import dotenv from 'dotenv';
dotenv.config();
import { createUploadLink } from '../routes/linkgenerator.js';
import { eventEmitter, searchFile } from '../services/fileService.js';
import { getFullHostname } from '../utils/urls.js';
import { dateToString } from '../utils/dates.js';
import { getFriendlyFileType, getThumbnailUrl } from '../utils/files.js';
import prettyBytes from 'pretty-bytes';


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
        searchFile(interaction.user.id, filename)
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
    const { channelId, userData, isDM, fileName, fileSize, expirationDate, downloadLink } = eventData;

    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error(`Channel not found: ${channelId}`);
        return;
    }

    const displayName = userData.global_name;
    const expirationDateString = dateToString(expirationDate);

    const friendlyName = await getFriendlyFileType(fileName);
    const fileThumbnail = await getThumbnailUrl(fileName);

    let avatarURL = "";
    if (userData) {
        // get avatar url from the hash on userData
        const avatarHash = userData.avatar;
        const userId = userData.id;
        if (avatarHash) {
            avatarURL = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
        } else {
            // default avatar if user has no avatar
            avatarURL = `https://cdn.discordapp.com/embed/avatars/${userId % 5}.png`;
        }
    } else {
        console.log('User not found');
        return;
    }
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${displayName} uploaded a file:`, // use the displayName instead of user.username
            url: downloadLink,
            iconURL: avatarURL
        })
        .setTitle(fileName)
        .setURL(downloadLink)
        .addFields(
            {
                name: "📁 File type",
                value: "`" + friendlyName + "`",
                inline: true
            },
            {
                name: "📊 File size",
                value: "`" + prettyBytes(fileSize) + "`",
                inline: true
            },
            {
                name: "📅 Expires at",
                value: "`" + expirationDateString + "`",
                inline: true
            },
            {
                name: "__Actions__",
                value: `🦠 [**Check on VirusTotal**](https://hello.com)\n🚩 [**Report file**](https://world.com)`,
                inline: false
            },
        )
        .setThumbnail(fileThumbnail) // TODO: thumbnail based on filetype
        .setColor(userData.accent_color.toString(16).padStart(6, '0'))
        .setFooter({
            text: displayName,
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

export default { client };