const database = require('../data/Database');
const { ApplicationCommandOptionType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');


function setExpirationDate(hoursToExpire) {
    const toMilliseconds = hoursToExpire * 60 * 60 * 1000;
    const currentDate = new Date().getTime();
    const expirationDate = currentDate + toMilliseconds;
    return expirationDate;
}


module.exports = {
    name: 'mute',
    description: "Mute a user from the server with an expiration time.",
    options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to mute.',
        required: true,
    }, {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'Reason for the mute.',
        required: false,
    }, {
        name: 'expiration-hours',
        type: ApplicationCommandOptionType.Integer,
        description: 'Number of hours until the mute is lifted.',
        required: false,
    }],
    execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Not specified';
        const issuerUsername = interaction.user.username;
        const expirationHours = interaction.options.getInteger('expiration-hours') || 1; // Set a default value of 1 hours
        const expirationDate = setExpirationDate(expirationHours);

        const muteOptions = { hours: expirationHours, reason };

        interaction.guild.members.mute(user.id, muteOptions).then(() => {
            interaction.reply(`User ${user.id} has been successfully muted with the reason: "${reason}" and will be unmuted after ${expirationHours} hours.`);

            const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('User Muted')
            .setDescription(`User ${user.id} has been muted with the reason: "${reason}" and will be unmuted after ${expirationHours} hours.`)
            .setTimestamp()
            .setFooter(`Muted by ${issuerUsername}`);

            // add thumbnail of the user profile picture
            if (user.avatarURL()) {
                embed.setThumbnail(user.avatarURL());
            }

            interaction.guild.channels.cache.get('CHANNEL_ID').send({ embeds: [embed] });
        });

        database.db.run(`INSERT INTO mutes(userId, reason, endTime) VALUES(?, ?, ?)`, [user.id, reason, expirationDate], function(err) {
            if (err) {
                return console.log(err.message);
            }
        });
    }
}