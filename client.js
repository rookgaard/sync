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

const socketClient = require('socket.io-client')('http://localhost:' + port);

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

function insertRow(newRow) {
//	console.log(newRow);
	var data = {
		table: newRow.table,
		values: newRow.fields
	};
//	console.log(data);
	socketClient.emit('insert', data);
}

function deleteRow(oldRow) {
//	console.log(oldRow);
	var data = {
		table: oldRow.table,
		values: oldRow.fields
	};
//	console.log(data);
	socketClient.emit('delete', data);
}

function updateRow(oldRow, newRow) {
//	console.log(oldRow, newRow);
	var data = {
		table: newRow.table,
		changedColumns: newRow.changedColumns,
		oldValues: oldRow.fields,
		newValues: newRow.fields
	};
//	console.log(data);
	socketClient.emit('update', data);
}

function valuesChanged(oldRow, newRow, event) {
	if (event) {
		console.log('event', event);
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
		if (tables.indexOf(oldRow.table) < 0) {
			return;
		}

		updateRow(oldRow, newRow);
	}
}

mysqlEventWatcher.add(dbName, valuesChanged);
