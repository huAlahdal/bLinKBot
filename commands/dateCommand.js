module.exports = {
    name: 'date',
    description: "This is date command",
    execute(interaction){
        interaction.reply('The current date is: ' + new Date());
     }
};