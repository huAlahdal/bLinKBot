module.exports = {
    name: 'hello',
    description: "This is hello command",
    execute(interaction){
        interaction.reply('Hello there, <@' + interaction.user.id + '>!');
     }
};