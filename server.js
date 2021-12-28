const app = require('http').createServer();
const socketServer = require('socket.io')(app);
const config = require('./config');
const port = config.port ? config.port : 3000;
const mysql = require('mysql');
let connection;

app.listen(port, function () {
	console.log('listening on port', app.address().port);
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
	connection = mysql.createConnection({
		host: config.dbHost ? config.dbHost : 'localhost',
		user: config.dbUser ? config.dbUser : 'root',
		password: config.dbPassword ? config.dbPassword : '',
		database: config.dbName ? config.dbName : ''
	});

	connection.connect(function (error) {
		if (error) {
			console.log('connection.connect error', error);
		}
	});
}

socketServer.on('connection', function (socket) {
	console.log('socketServer', 'connection');
	socket.on('insert', function (data) {
		if (data.apiPassword !== config.apiPassword) {
			return;
		}

		const sql = 'INSERT INTO `{0}` ({1}) VALUES({2})';

		let keys = [];
		let values = [];

		for (const key in data.values) {
			keys.push('`' + key + '`');
			let value = data.values[key];

			if (value === null) {
				values.push('NULL');
			} else if (typeof value === 'string' && value.indexOf('.000Z') > 0) {
				value = value.replace('T', ' ').replace('.000Z', '');
				values.push('"' + value + '"');
			} else {
				values.push('"' + value + '"');
			}
		}

		const query = String.format(sql, data.table, keys.join(', '), values.join(', '));
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
		if (data.apiPassword !== config.apiPassword) {
			return;
		}

		const sql = 'DELETE FROM `{0}` WHERE {1}';

		let conditions = [];

		for (const key in data.values) {
			const value = data.values[key];

			if (value === null) {
				continue;
			}

			conditions.push('`' + key + '` = "' + value + '"');

			if (key === 'id' || conditions.length >= 3) {
				break;
			}
		}

		const query = String.format(sql, data.table, conditions.join(' AND '));
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

	socket.on('update', function (data) {
		if (data.apiPassword !== config.apiPassword) {
			return;
		}

		const sql = 'UPDATE `{0}` SET {1} WHERE {2}';

		let values = [];
		let conditions = [];

		for (const key of data.changedColumns) {
			let value = data.values[key];
			if (value === null) {
				value = 'NULL';
			} else if (typeof value === 'string' && value.indexOf('.000Z') > 0) {
				value = value.replace('T', ' ').replace('.000Z', '');
			}

			values.push('`' + key + '` = "' + value + '"');
		}

		for (const key in data.values) {
			const value = data.values[key];

			if (value === null) {
				continue;
			}

			conditions.push('`' + key + '` = "' + value + '"');

			if (key === 'id' || conditions.length >= 3) {
				break;
			}
		}

		const query = String.format(sql, data.table, values.join(', '), conditions.join(' AND '));
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

	socket.on('disconnect', function (data) {
		console.log('socket', 'disconnect');
	});
});

dbConnection();
