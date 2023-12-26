// This module exports a 'ban' command for a Discord bot.
// The command bans a user from the server with an optional expiration time and reason.
// The `setExpirationDate` function calculates the expiration date of the ban.
// The `checkExpirationDate` function checks if the ban has expired.

const database = require('../data/Database');
const { ApplicationCommandOptionType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// This function calculates the expiration date of the ban.
// It takes the number of days to ban as input and returns the expiration date in milliseconds.
function setExpirationDate(daysToExpire) {
    const toMilliseconds = daysToExpire * 24 * 60 * 60 * 1000;
    const currentDate = new Date().getTime();
    const expirationDate = currentDate + toMilliseconds;
    return expirationDate;
}

// This function checks if the ban has expired.
// It takes the expiration date in milliseconds as input and returns true if the ban has expired, false otherwise.
function checkExpirationDate(expirationDate) {
    const currentDate = new Date().getTime();
    if (currentDate > expirationDate) {
        return true;
    }
    return false;
}

module.exports = {
    name: 'ban',
    description: "Ban a user from the server with an expiration time.",
    options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to ban.',
        required: true,
    }, {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'Reason for the ban.',
        required: false,
    }, {
        name: 'expiration-days',
        type: ApplicationCommandOptionType.Integer,
        description: 'Number of days until the ban is lifted.',
        required: false,
    }],
    execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Not specified';
        const issuerUsername = interaction.user.username;
        const expirationDays = interaction.options.getInteger('expiration-days') || 7; // Set a default value of 7 days
        const expirationDate = setExpirationDate(expirationDays);

        const banOptions = { days: expirationDays, reason };

        interaction.guild.members.ban(user.id, banOptions).then(() => {
            interaction.reply(`User ${user.id} has been successfully banned with the reason: "${reason}" and will be unbanned after ${expirationDays} days.`);

            const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('User Banned')
            .addFields(
                { name: 'Name', value: `${user.username}#${user.discriminator}\n`, inline: true },
                { name: 'ID', value: `${user.id}\n`, inline: true },
                { name: 'Moderator', value: `${issuerUsername}\n`},
                { name: 'Expiration', value: `${expirationDays} days\n`},
                { name: 'Reason', value: `${reason}\n`}
            )
            .setFooter({ text: `User has been banned from the server` })
            .setTimestamp();
            if (user.avatarURL()) // Check if user has a public avatar
            {
                embed.setThumbnail(user.avatarURL()); // Add thumbnail of the banned user profile picture
            }

            interaction.channel.send({ embeds: [embed] });

            // Ban the user and add them to the bans table in your database
            try {
                database.db.run("INSERT INTO bans (userId, username, reason, issuer, endTime) VALUES (?, ?, ?, ?, ?)",
                 user.id, user.username, reason, issuerUsername, expirationDate);
                console.log(`successfully added ${user.username} to bans table`)
            } catch (err) {
                console.error(err.message);
            }

        }).catch((error) => {
            console.error(error);
            interaction.reply({ content: 'An error occurred while trying to ban this user.', ephemeral: true });
        });
    }
};