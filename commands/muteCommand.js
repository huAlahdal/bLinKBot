const { ApplicationCommandOptionType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { muteUserForDuration } = require('../utilits/muteUserForDuration');

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
        name: 'expiration-minutes',
        type: ApplicationCommandOptionType.Integer,
        description: 'Number of minutes until the mute is lifted.',
        required: false,
    }],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'Not specified';
        const issuerUsername = interaction.user.username;
        const expirationMinutes = interaction.options.getInteger('expiration-minutes') || 60; // Set a default value of 1 minutes

        muteUserForDuration(member, expirationMinutes, false, reason).then((muted) => {
            if (muted) {
                const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('User Muted')
                .setDescription(`User ${user.username} has been muted.`)
                .addFields({ name: 'Reason', value: `${reason}\n`, inline: true},
                            { name: 'Duration', value: `${expirationMinutes} Minutes\n`})
                .setTimestamp()
                .setFooter({ text: `Muted by ${issuerUsername}` });
                if (user.avatarURL()) {
                    embed.setThumbnail(user.avatarURL());
                }

                interaction.reply({ embeds: [embed] });
            }            
        });
    }
}