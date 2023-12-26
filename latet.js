client.on('messageCreate', async message => {
    if (message.content === '/ping') {
        message.reply('Pong!');
    } 
    else if (message.content.startsWith( '/help' )) {
        let supportRole = message.guild.roles.cache.find(role => role.name === 'support'); // replace ‘support’ with your actual support role name
        if (!supportRole) return message.channel.send('Support role not found');

        // Get the problem description from /help command
        let args = message.content.slice( 6 ).trim().split(/\s+/);
        let issueDescription = args.join(" ");

        if (!issueDescription) {
            return message.channel.send('Please provide a valid reason for help');
        }

        // random number for ticket id
        let ticketId = Math.floor(Math.random() * 100000);

        const channel = await message.guild.channels.create({
            name: `${ticketId}-help`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: message.author.id,
                    allow: ['ViewChannel', 'SendMessages']
                },
                {
                    id: supportRole.id,
                    deny: ['ViewChannel'],
                    allow: ['ViewChannel', 'SendMessages']
                }
            ]
        });

        message.channel.send(`Created help channel ${channel} for you and support role to view it`);
        channel.send(`New help ticket from ${message.author} with the following problem:` + `\n` + '```' + `\n` + issueDescription + `\n` + '```' + `\n` + `Please wait for support to help you`);
    }
     // Check if the message is a command and has sufficient permissions
    else if (message.content.startsWith('//ban')) {
        // Split the message into arguments
        const args = message.content.split(' ');
        
        // Make sure a user and a reason were provided
        if (args.length < 3) return message.channel.send('Usage: /ban @user reason');
        
        // Get the user to be banned and combine the rest of the arguments into one string for the ban reason
        const target = message.mentions.users.first();
        const reason = args.slice(2).join(' ');
        
        if (!target) return message.channel.send("You didn't mention a user to ban!");
        
        // Get the username of the user who issued the command
      const issuerUsername = message.author.username;
      const targetUsername = target.username;
      
      // Ban the user and add them to the bans table in your database
      try {
        db.run("INSERT INTO bans (userId, username, reason, issuer) VALUES (?, ?, ?, ?)", target.id, targetUsername, reason, issuerUsername);
      } catch (err) {
        console.error(err.message);
      }
      
      // Send a message confirming the ban and delete the original command message after 10 seconds
      try {
        const msg = await message.channel.send(`Banned ${target.tag} for reason: ${reason}. Issued by: ${issuerUsername}`);
        setTimeout(() => msg.delete(), 10000);
      } catch (err) {
        console.error(err.message);
      }
    }
    // Check if the message is a command and has sufficient permissions
    else if (message.content === '/show_bans') {
        // Retrieve ban entries from your database
        try {
            db.all('SELECT * FROM bans', [], (err, rows) => {
            if (err) throw err;
            
            let response = '\nUser ID - Username - IssuedBy - Reason:\n';
            
            // Build a list of all ban entries in the format: UserID - Reason
            for(let i = 0; i < rows.length; i++){
                response += '```' + `${rows[i].userId} - ${rows[i].username} - ${rows[i].issuer} - ${rows[i].reason}\n` + '```';
            }
            
            // response += '```';
            
            // Send the list of bans in a code block to prevent Markdown formatting issues
            message.channel.send(response);
            });
        } catch (err) {
            console.error(err.message);
        }
    }
    else if (message.content.startsWith('/unban')) {
        // Split the message into arguments
        const args = message.content.split(' ');
        
        // Make sure a user was provided
        if (args.length < 2) return message.channel.send('Usage: /unban @user');
        
        // Get the target to be unbanned
        const target = message.mentions.users.first();
        
        if (!target) return message.channel.send("You didn't mention a user to unban!");
      
        // Unban the user by removing them from the bans table in your database
        try {
            db.run("DELETE FROM bans WHERE userId = ?", target.id);
        } catch (err) {
            console.error(err.message);
        }
      
        // Send a message confirming the unban and delete the original command message after 10 seconds
        try {
            const msg = await message.channel.send(`Unbanned ${target.tag}`);
            setTimeout(() => msg.delete(), 10000);
        } catch (err) {
            console.error(err.message);
        }
    }
})