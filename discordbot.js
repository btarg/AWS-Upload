const { Client, Intents, IntentsBitField, SlashCommandBuilder } = require('discord.js');
const client = new Client({
    // should be able to read and write to guilds, read guild members, read messages, and read message content
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent]
});
require('dotenv').config();

const { createUploadLink } = require('./routes/linkgenerator');
const { eventEmitter, searchFile } = require('./services/fileService');
const { getFullHostname } = require('./utils/hostname');

client.login(process.env.DISCORD_BOT_TOKEN);

client.on('ready', () => {
    console.log(`Discord bot is ready`);

    // new slash command
    const generateLinkCommand = new SlashCommandBuilder()
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
    client.application.commands.create(generateLinkCommand);
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

        createUploadLink(interaction.guild.id, finalChannel, interaction.user.id, isDM)
            .then((link) => {
                //TODO: generate proper message content
                // ephemerally reply with the link
                interaction.reply({ content: link, ephemeral: true });

            })
            .catch((error) => {
                console.error('Error generating link:', error);
                interaction.reply('Failed to generate link');
            });
    } else if (commandName === 'searchfile') {
        const filename = interaction.options.getString('filename');
        console.log("Searching for file: " + filename);
        searchFile(interaction.guild.id, interaction.user.id, filename)
            .then((file) => {
                console.log(file[0]);
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



eventEmitter.on('fileUploaded', (eventData) => {
    const { channelId, userId, isDM, fileName, downloadLink } = eventData;
    console.log(`File uploaded: ${fileName} - ${downloadLink}`);
    if (isDM === true) {
        console.log("Sending DM message");
        // if this is a DM, the channel ID acts as the recipient
        client.users.send(channelId, downloadLink);

    } else {
        console.log("Sending channel message");
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            console.error(`Channel not found: ${channelId}`);
            return;
        }
        channel.send(downloadLink);
    }


});

module.exports = {
    client
};