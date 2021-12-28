const app = require('http').createServer();
const socketServer = require('socket.io')(app);
const config = require('./config');
const port = config.port ? config.port : 3000;
const mysql = require('mysql');
let connection;

app.listen(port);

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
	socket.on('insert', function (data) {
		const sql = 'INSERT INTO `{0}` ({1}) VALUES({2})';

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

		const query = String.format(sql, data.table, keys.join(', '), values.join(', '));

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
		const sql = 'UPDATE `{0}` SET {1} WHERE {2}';

		let values = [];
		let conditions = [];

		for (const key of data.changedColumns) {
			let value = data.values[key];
			if (value === null) {
				value = 'NULL';
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

		if (connection) {
			connection.query(query, function (error, result) {
				if (error) {
					console.log('connection.query error', error);
					dbConnection();
				}
			});
		}
	});
});

dbConnection();
