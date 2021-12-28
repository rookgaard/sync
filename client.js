const config = require('./config');
const MySQLEvents = require('mysql-events');
const mysqlEventWatcher = MySQLEvents({
	host: config.dbHost ? config.dbHost : 'localhost',
	user: config.dbUser ? config.dbUser : 'root',
	password: config.dbPassword ? config.dbPassword : ''
});
const tables = JSON.parse(config.dbTables ? config.dbTables : '[]');
const port = config.port ? config.port : 3000;

const socketClient = require('socket.io-client')('http://localhost:' + port);
console.log(socketClient);

socketClient.on('connect', function () {
	console.log('socketClient', 'connect');
	socketClient.emit('test', Date.now());
});

socketClient.on('event', function (data) {
	console.log('socketClient', 'event', data);
});

socketClient.on('disconnect', function () {
	console.log('socketClient', 'disconnect');
});

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
