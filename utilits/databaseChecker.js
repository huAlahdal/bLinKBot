const database = require('../data/Database');

function getIsMuted(userId) {
    database.db.get(`SELECT * FROM mutes WHERE userId = ?`, [userId], function(err, row) {
        if (row && row.roles) {
            // get duration
            const duration = row.duration;
            return duration;
        } else {
            return false;
        }
    });
}

