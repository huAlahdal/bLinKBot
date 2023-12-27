const { unmuteUser } = require('../utilits/muteUserForDuration');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name : 'unmute',
    description : "Unmute a user from the server.",
    options: [{
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to unmute.',
        required: true,
    }],
    execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        unmuteUser(member).then((unmuted) => {
            if (unmuted) {
                interaction.reply(`User ${user.username} has been successfully unmuted.`);
            } else {
                interaction.reply(`User ${user.username} is not muted.`);
            } 
        });
    }
}