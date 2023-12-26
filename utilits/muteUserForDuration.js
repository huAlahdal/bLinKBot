async function muteUserForDuration(message, duration) {
    const member = message.member;
    // duration  in minutest to milliseconds
    const milliseconds = duration * 60 * 1000;
    const role = message.guild.roles.cache.find((role) => role.name === 'Muted') ?? null;

    if (!role) {
        throw new Error('Muted role does not exist in the guild.');
    }

    // Add the muted role to the user
    await member.roles.add(role);

    setTimeout(() => {
        member.roles.remove(role);
    }, milliseconds);
}
  
module.exports = { muteUserForDuration };