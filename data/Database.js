const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite', (err) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Connected to the database.');
         });
    }
    
    async init() {
        // Create bans table if it doesn't exist already
        this.db.run("CREATE TABLE IF NOT EXISTS bans (userId TEXT, username TEXT, reason TEXT, issuer TEXT, endTime INTEGER)", function(err){
            if (err) throw err;
         });
      
        // Create mutes table if it doesn't exist already
        this.db.run("CREATE TABLE IF NOT EXISTS mutes (userId TEXT, reason TEXT, roles JSON, endTime INTEGER)", function(err){ // change roles from OBJECT to JSON
            if (err) throw err;
          });

        // Create warnings table if it doesn't exist already
        this.db.run("CREATE TABLE IF NOT EXISTS warnings (userId TEXT, reason TEXT, issuer TEXT)", function(err){
            if (err) throw err;
        });
    }
}

module.exports = new Database();