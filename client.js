const config = require('./config');
const MySQLEvents = require('mysql-events');
const mysqlEventWatcher = MySQLEvents({
	host: config.dbHost ? config.dbHost : 'localhost',
	user: config.dbUser ? config.dbUser : 'root',
	password: config.dbPassword ? config.dbPassword : ''
});
const dbName = config.dbName ? config.dbName : '';
const tables = JSON.parse(config.dbTables ? config.dbTables : '[]');
const port = config.port ? config.port : 3000;

const socketClient = require('socket.io-client')(config.host + ':' + port);

socketClient.on('connect', function () {
	console.log('socketClient', 'connect');
});

socketClient.on('disconnect', function () {
	console.log('socketClient', 'disconnect');
});

function insertRow(newRow) {
//	console.log('insertRow', newRow);
	socketClient.emit('insert', {
		apiPassword: config.apiPassword,
		table: newRow.table,
		values: newRow.fields
	});
}

function deleteRow(oldRow) {
//	console.log('deleteRow', oldRow);
	socketClient.emit('delete', {
		apiPassword: config.apiPassword,
		table: oldRow.table,
		values: oldRow.fields
	});
}

function updateRow(newRow) {
//	console.log('updateRow', newRow);
	socketClient.emit('update', {
		apiPassword: config.apiPassword,
		table: newRow.table,
		changedColumns: newRow.changedColumns,
		values: newRow.fields
	});
}

function valuesChanged(oldRow, newRow, event) {
	if (event) {
		console.log(event);
	}

	if (oldRow === null) {
		if (tables.indexOf(newRow.table) < 0) {
			return;
		}

		insertRow(newRow);
	}

	if (newRow === null) {
		if (tables.indexOf(oldRow.table) < 0) {
			return;
		}

		deleteRow(oldRow);
	}

	if (oldRow !== null && newRow !== null) {
		if (tables.indexOf(newRow.table) < 0) {
			return;
		}

		updateRow(newRow);
	}
}

mysqlEventWatcher.add(dbName, valuesChanged);
