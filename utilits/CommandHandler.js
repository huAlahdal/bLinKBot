const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config(); // to load .env variables

class CommandHandler {
    constructor(client) {
        this.client = client;
        
        this.commands = new Collection();
        const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            this.commands.set(command.name, command);
        }
    }
    
    async registerCommands() {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        
        try {
            console.log('Started refreshing application (/) commands.');
            
            // Make a PUT request to Discord API
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
                { body: this.commands },
            );
            
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = CommandHandler;