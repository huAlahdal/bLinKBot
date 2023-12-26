// get db from bot.js
const database = require('../data/Database');

module.exports = {
    name: 'showbans',
    description: "Show all bans.",
    execute(interaction) {
        // Show all bans
        try {
            database.db.all(`SELECT * FROM bans`, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(rows);
                    const string = rows.map(row => '```' + `${row.userId} | ${row.username} | ${row.reason} | ${row.issuer}` + '```')
                    interaction.reply(`userId | username | reason | issuer\n ${string}`);
                }
            });
        } catch (err) {
            console.error(err.message);
        }
    }
};