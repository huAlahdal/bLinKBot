const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
    name: 'purge',
    description: "Purge all messages in a channel.",
    options: [{
        name: 'number',
        type: ApplicationCommandOptionType.Integer,
        description: 'Number of messages to purge.',
        required: true,
    }],
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: 'You do not have permission to manage messages', ephemeral: true });
        
        const amount = interaction.options.getInteger('number');
        
        if (amount > 100 || amount < 1) {
            return interaction.reply({ content: `Please provide a number between 1 and 100`, ephemeral: true });
        }
        
        await interaction.channel.messages.fetch({ limit: amount })
            .then(async (messages) => {
                if (messages.size < 1)  {
                    interaction.reply({ content: 'No messages to delete', ephemeral: true });
                    setTimeout(() => interaction.deleteReply(), 3000);
                }
                else if (messages.size === 1)  {
                    await messages.first().delete();
                    interaction.reply({ content: `Deleted 1 message`, ephemeral: true });
                    setTimeout(() => interaction.deleteReply(), 3000);
                }
                // Bulk delete all messages that have been fetched and are not older than 14 days (due to the Discord API)
                else {
                    await interaction.channel.bulkDelete(messages, true);
                    interaction.reply({ content: `Deleted ${messages.size} messages`, ephemeral: true });
                    setTimeout(() => interaction.deleteReply(), 3000);
                }
            })
            .catch((err) => console.error(err));
    },
};