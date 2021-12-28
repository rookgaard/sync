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

function insertRow(newRow) {
	socketClient.emit('insert', {
		table: newRow.table,
		values: newRow.fields
	});
}

function deleteRow(oldRow) {
	socketClient.emit('delete', {
		table: oldRow.table,
		values: oldRow.fields
	});
}

function updateRow(newRow) {
	socketClient.emit('update', {
		table: newRow.table,
		changedColumns: newRow.changedColumns,
		values: newRow.fields
	});
}

function valuesChanged(oldRow, newRow, event) {
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

		updateRow(newRow);
	}
}

mysqlEventWatcher.add(dbName, valuesChanged);
