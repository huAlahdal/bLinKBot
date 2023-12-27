const { Events } = require('discord.js');
const CommandHandler = require('./CommandHandler.js');
const { muteUserForDuration } = require('./muteUserForDuration');
const UserProfanityLimiter = require('./userProfanityLimiter'); // Import the user profanity limiter class
const { getBadWords, hasProfanity } = require('./profanityChecker'); // Import bad words manager functions
const config = require('../config');

module.exports = async (client) => {
    // Assuming `client` is your Discord Client instance
    const commandHandler = new CommandHandler(client);
    client.commandHandler = commandHandler;

    const badWordsJSON = config.badWordsJSON;
    const userProfanityLimit = config.userProfanityLimit; // Get the limit from configuration
    const muteDurationMinutes = config.muteDurationMinutes; // Get the duration from configuration
    const badWords = await loadBadWords(badWordsJSON);
    const profanityLimiter = new UserProfanityLimiter(userProfanityLimit); // Create a limiter instance


    // Read the JSON file containing bad words and parse them into an array
    async function loadBadWords(badWordsJSON) {
        return await getBadWords(badWordsJSON);
    }

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return;
        const command = client.commandHandler.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    });

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        // When a reaction is received, check if the structure is partial
        
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        
        const message = reaction.message;
        const emojiName = reaction.emoji.name;

        // Check if the message ID matches your specific message ID
        if (message.id === '1188046653740032001') {
            // if user reacted with correct emoji give them a role
            // if (emojiName === '👍') {
            //     const guild = client.guilds.cache.get('1188046653740032000');
            //     const member = guild.members.cache.get(user.id);
            //     const role = guild.roles.cache.get('1188046653740032002');
            //     member.roles.add(role);
            // }
        }
    });

    client.on(Events.GuildMemberAdd, async member => {
        // Send the message to a designated channel on a server:
        const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
        // Do nothing if the channel wasn't found on this server
        if (!channel) return;
        // Send the message, mentioning the member
        channel.send(`Welcome to the server, ${member}`);
    });

    client.on(Events.MessageCreate, async message => {
        // Ignore messages from bots
        if(message.author.bot) return;
        
        const hasProfanityInMessage = hasProfanity(message, badWords);

        if (hasProfanityInMessage) {
        // Increment the profanity count for this user
        profanityLimiter.incrementCounter(message.author);

        // remove the message that contains profanity
        try {
            await message.delete();
        } catch (error) {
            console.error('Error while deleting message:', error);
        }

        // write timeout warning message to the user
        const warningMessage = await message.channel.send(`${message.author}, please do not use profanity in this server!`);
        setTimeout(() => {
            warningMessage.delete();
        }, 5000);

        if (profanityLimiter.isOverLimit(message.author)) {
            try {
            await muteUserForDuration(message, muteDurationMinutes);
            } catch (error) {
            console.log('Error while muting user:', error);
            }
        }
        } else {
            profanityLimiter.resetCounter(message.author); // Reset the counter if there is no profanity in the message
        }
    });
    
}