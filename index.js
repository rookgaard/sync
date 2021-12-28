const config = require('./config');
const MySQLEvents = require('mysql-events');
const mysqlEventWatcher = MySQLEvents({
	host: config.dbHost ? config.dbHost : 'localhost',
	user: config.dbUser ? config.dbUser : 'root',
	password: config.dbPassword ? config.dbPassword : ''
});
const tables = JSON.parse(config.dbTables ? config.dbTables : '[]');

function valuesChanged(oldRow, newRow, event) {
	console.log(oldRow, newRow, event);
	//row inserted
	if (oldRow === null) {
		//insert code goes here
	}

	//row deleted
	if (newRow === null) {
		//delete code goes here
	}

	//row updated
	if (oldRow !== null && newRow !== null) {
		//update code goes here
	}

	//detailed event information
	//console.log(event);
}

for (const table of tables) {
	mysqlEventWatcher.add(table, valuesChanged);
}
