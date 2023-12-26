const { Client, IntentsBitField, Partials  } = require('discord.js');
const CommandHandler = require('./utilits/CommandHandler'); 
const Database = require('./data/Database'); // Assuming that your 'Database' is in a file named 'Database.js' located in the same directory as main file

require('dotenv').config(); // to load .env variables

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions
    ],
    partials: [
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.Channel,
        Partials.User
    ]
});

//require('./commandsLoader')(client); // Load commands from 'commands' directory
require('./utilits/eventHandler')(client); // Listen for events like interactionCreate

// After everything has been set up, register commands and initialize database
new CommandHandler(client).registerCommands();
Database.init();

// start the bot
client.login(process.env.TOKEN);