const database = require('../data/Database');

function setExpirationDate(hoursToExpire) {
    const toMilliseconds = hoursToExpire * 60 * 1000;
    const currentDate = new Date().getTime();
    const expirationDate = currentDate + toMilliseconds;
    return expirationDate;
}

async function muteUserForDuration(member, duration, isOld = false, reason) {
    const memberRoles = member.roles.cache.map(role => role.id);
    const expirationDate = setExpirationDate(duration);
    const role = member.guild.roles.cache.find((role) => role.name === 'Muted');

    if (!role) {
        throw new Error('Muted role does not exist in the guild.');
    }

    const unmuteAfterDuration = () => {
        setTimeout(() => {
            unmuteUser(member, memberRoles)
        }, duration * 60 * 1000);
    };

    if (isOld) {
        unmuteAfterDuration();
        return;
    }

    try {
        await database.db.run(
            `INSERT INTO mutes (userId, reason, roles, endTime) VALUES (?, ?, ?, ?)`,
            [member.id, reason, JSON.stringify(memberRoles.join()), expirationDate]
        );

        await member.roles.set([]);
        await member.roles.add(role);

        unmuteAfterDuration();
        return true;
    } catch (err) {
        console.error(err.message);
    }
}

async function unmuteUser(member, roles = []) {

    const muteRole = member.guild.roles.cache.find((role) => role.name === 'Muted');

    if (!muteRole || !member.roles.cache.has(muteRole.id)) {
        return false;
    }

    const query = `SELECT * FROM mutes WHERE userId = ?`;
    const params = [member.id];

    try {
        const { roles: savedRoles } = await database.db.get(query, params) || {};
        const rolesToSet = savedRoles ? JSON.parse(savedRoles).split(',') : roles;

        if (rolesToSet.length > 0) {
            await member.roles.set(rolesToSet);
            await member.roles.remove(muteRole.id);
        } else {
            console.log('No mute data found for user or invalid data');
        }

        await database.db.run(`DELETE FROM mutes WHERE userId = ?`, params);
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
        
}

async function checkMutes(client) {
    try {
        await database.db.all(`SELECT * FROM mutes WHERE endTime < ?`, [new Date().getTime()], async function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows.length > 0) {
                    rows.forEach(async row => {
                        const guild = client.guilds.cache.get('1003624187971252224');
                        const member = await guild.members.fetch(row.userId);
                        const roles = JSON.parse(row.roles).split(',');
                        await unmuteUser(member, roles);
                    });
                }
            }
        });
    } catch (err) {
        console.error(err.message);
    }
}
  
module.exports = { muteUserForDuration, unmuteUser, checkMutes };