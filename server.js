const app = require('http').createServer();
const socketServer = require('socket.io')(app);
const config = require('./config');
const port = config.port ? config.port : 3000;
const mysql = require('mysql');
let connection;

app.listen(port, function () {
	console.log('nasluchuje na porcie', app.address().port);
});

if (!String.format) {
	String.format = function (format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};
}

function dbConnection() {
	console.log('connecting db');

	connection = mysql.createConnection({
		host: config.dbHost ? config.dbHost : 'localhost',
		user: config.dbUser ? config.dbUser : 'root',
		password: config.dbPassword ? config.dbPassword : '',
		database: config.dbName ? config.dbName : ''
	});

	connection.connect(function (error) {
		if (error) {
			console.log('connection.connect error', error);
		} else {
			console.log('db connected');
		}
	});
}

socketServer.on('connection', function (socket) {
	console.log('socketServer', 'connection');

	socket.on('test', function (data) {
		console.log('test', data);
	});

	socket.on('insert', function (data) {
		console.log('insert', data);
		const sql = 'INSERT INTO {0} ({1}) VALUES({2})';

		let keys = [];
		let values = [];

		for (const key in data.values) {
			keys.push('`' + key + '`');
			const value = data.values[key];

			if (value === null) {
				values.push('NULL');
			} else {
				values.push('"' + value + '"');
			}
		}

		const query = String.format(sql, data.table, keys.join(), values.join());
		console.log(query);

		if (connection) {
			connection.query(query, function (error, result) {
				if (error) {
					console.log('connection.query error', error);
					dbConnection();
				}
			});
		}
	});

	socket.on('delete', function (data) {
		console.log('delete', data);
	});

	socket.on('update', function (data) {
		console.log('update', data);
	});
});

dbConnection();
